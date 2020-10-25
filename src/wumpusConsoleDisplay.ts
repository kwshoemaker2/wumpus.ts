
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusOptions } from './wumpusOptions'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';

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

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your
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

    showPlayerFellInPit(): void
    {
        this.writeConsole(`*AAAUUUUGGGGGHHHHHhhhhhhhhhh...*
The whistling sound and updraft as you walked into this room of the
cave apparently wasn't enough to clue you in to the presence of the
bottomless pit.  You have a lot of time to reflect on this error as
you fall many miles to the core of the earth.  Look on the bright side;
you can at least find out if Jules Verne was right...\n`);
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
