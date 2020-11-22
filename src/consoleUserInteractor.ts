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
            } else if(answer.startsWith("s")) {
                command = await this.parseShootCommand(answer);
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

    private async parseShootCommand(answer: string): Promise<WumpusCommand> {
        let args = this.splitArgs(answer);
        let rooms = this.parseRooms(args);

        return new Promise<WumpusCommand>((resolve) => {
            resolve(new WumpusCommand(WumpusCommandType.Shoot, rooms));
        });
    }

    private splitArgs(answer: string): string {
        return answer.slice(2);
    }

    private parseRooms(args: string): number[] {
        let rooms: number[] = [];
        const strArgs = args.split(" ");
        for(let i = 0; i < strArgs.length; i++) {
            const room = parseInt(strArgs[i]);
            if(!isNaN(room)) {
                rooms.push(room);
            }
        }

        return rooms;
    }
}
