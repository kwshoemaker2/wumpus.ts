
import { WumpusOptions } from './wumpusOptions'

/**
 * Hunt the Wumpus game.
 */
export class Wumpus {
    private options: WumpusOptions;

    public constructor(options: WumpusOptions) {
        this.options = options;
    }

    public run() {
        console.log(`Hunt the Wumpus!

You're in a cave with ${this.options.numRooms} rooms and ${this.options.numDoors} tunnels leading from each room.\n
There are ${this.options.numBats} bats and ${this.options.numPits} pits scattered throughout the cave, and your\n
quiver holds ${this.options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n`);
    }
}