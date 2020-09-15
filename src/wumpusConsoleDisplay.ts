
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusOptions } from './wumpusOptions'
import { WumpusCommand, WumpusAction } from './wumpusAction';

export type ConsoleWrite = (message: string) => void;
export type ConsolePrompt = (prompt: string) => Promise<string>;

/**
 * WumpusDisplay implementation that outputs to the console.
 */
export class WumpusConsoleDisplay implements WumpusDisplay {

    private writeConsole: ConsoleWrite;
    private promptUser: ConsolePrompt;

    public constructor(theConsole: ConsoleWrite, consolePrompt: ConsolePrompt) {
        this.writeConsole = theConsole;
        this.promptUser = consolePrompt;
    }

    public showIntroduction(options: WumpusOptions): void {
        this.writeConsole(`Hunt the Wumpus!

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.\n
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your\n
quiver holds ${options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n`);
    }

    public showRoomEntry(room: WumpusRoom): void {
        this.writeConsole(`You are in room ${room.getRoomNumber()} of the cave`);
        
        const neighbors: WumpusRoom[] = room.getNeighbors();
        this.printNeighbors(neighbors);

        if(room.pitNearby()) {
            this.writeConsole("*whoosh* (I feel a draft from some pits).");
        }
    }

    private printNeighbors(neighbors: WumpusRoom[])
    {
        if(neighbors.length > 0) {
            let output: string = `There are tunnels leading to rooms ${neighbors[0].getRoomNumber()}`;
            for(let i = 1; i < neighbors.length; i++) {
                output += `, ${neighbors[i].getRoomNumber()}`
            }
            this.writeConsole(output);
        }
    }

    public showPlayerHitWall(): void {
        this.writeConsole("Oof! (you hit the wall)\n")
    }

    public async getUserAction(): Promise<WumpusAction> {
        let validAnswer: boolean = false;
        let action: WumpusAction = null;
        while(!validAnswer) {
            const answer = await this.promptUser("-> Move or shoot? [ms?q] ");
            if(answer === "q") {
                action = new WumpusAction(WumpusCommand.Quit, []);
            } else if(answer.startsWith("m")) {
                const rooms = this.parseRooms(answer);
                if(rooms.length > 0) {
                    action = new WumpusAction(WumpusCommand.Move, rooms);
                } else {
                    this.writeConsole("Move where? For example: 'm 1'");
                }
            } else {
                this.writeConsole(" > I don't understand. Try '?' for help.\n");
            }
            validAnswer = (action !== null);
        }

        return new Promise<WumpusAction>((resolve) => {
            resolve(action);
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
