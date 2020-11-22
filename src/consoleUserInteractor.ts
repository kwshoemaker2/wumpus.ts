import { UserInteractor } from './userInteractor'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';
import { ConsoleWrite, ConsolePrompt } from "./consoleUtils"

/**
 * Interacts with the user via the console.
 */
export class ConsoleUserInteractor implements UserInteractor {
    private writeConsole: ConsoleWrite;
    private promptUser: ConsolePrompt;

    public constructor(theConsole: ConsoleWrite, consolePrompt: ConsolePrompt) {
        this.writeConsole = theConsole;
        this.promptUser = consolePrompt;
    }

    public async getUserCommand(): Promise<WumpusCommand> {
        let validAnswer: boolean = false;
        let command: WumpusCommand = null;
        while(!validAnswer) {
            const answer = await this.promptUser("Move or shoot? (m-s) ");
            if(answer === "q") {
                command = new WumpusCommand(WumpusCommandType.Quit, []);
            } else if(answer.startsWith("m")) {
                command = await this.parseMoveCommand(answer);
            } else {
                this.writeConsole("I don't understand!\n");
            }
            validAnswer = (command !== null);
        }

        return new Promise<WumpusCommand>((resolve) => {
            resolve(command);
        });
    }

    private async parseMoveCommand(answer: string): Promise<WumpusCommand> {
        let args = this.splitArgs(answer);
        let rooms = this.parseRooms(args);
        while(rooms.length < 1) {
            rooms = this.parseRooms(await this.promptUser("To which room do you wish to move? "));
        }

        return new Promise<WumpusCommand>((resolve) => {
            resolve(new WumpusCommand(WumpusCommandType.Move, rooms));
        });
    }

    private splitArgs(answer: string): string {
        const split = answer.split(" ");
        if(split.length > 1) {
            return split[1];
        } else {
            return "";
        }
    }

    private parseRooms(args: string): number[] {
        let rooms: number[] = [];
        if(args.length > 0) {
            const room = parseInt(args[0]);
            if(!isNaN(room)) {
                rooms.push(room);
            }
        }
        return rooms;
    }
}
