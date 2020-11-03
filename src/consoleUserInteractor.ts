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
            const answer = await this.promptUser("-> Move or shoot? [ms?q] ");
            if(answer === "q") {
                command = new WumpusCommand(WumpusCommandType.Quit, []);
            } else if(answer.startsWith("m")) {
                const rooms = this.parseRooms(answer);
                if(rooms.length > 0) {
                    command = new WumpusCommand(WumpusCommandType.Move, rooms);
                } else {
                    this.writeConsole("Move where? For example: 'm 1'");
                }
            } else {
                this.writeConsole(" > I don't understand. Try '?' for help.\n");
            }
            validAnswer = (command !== null);
        }

        return new Promise<WumpusCommand>((resolve) => {
            resolve(command);
        });
    }

    private parseRooms(answer: string): number[] {
        let rooms: number[] = [];
        const strArgs = answer.split(" ").splice(1);
        for(let i = 0; i < strArgs.length; i++) {
            rooms.push(parseInt(strArgs[i]));
        }
        return rooms;
    }
}
