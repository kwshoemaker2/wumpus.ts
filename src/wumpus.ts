
import { WumpusOptions } from './wumpusOptions'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'

/**
 * Hunt the Wumpus game.
 */
export class Wumpus {
    private options: WumpusOptions;
    private cave: WumpusCave;

    public constructor(options: WumpusOptions, cave: WumpusCave) {
        this.options = options;
        this.cave = cave;
    }

    public run() {
        this.showIntroduction();
        
        let currentRoom: WumpusRoom = this.cave.getCurrentRoom();

    }

    private showIntroduction() {
        console.log(`Hunt the Wumpus!

You're in a cave with ${this.options.numRooms} rooms and ${this.options.numDoors} tunnels leading from each room.\n
There are ${this.options.numBats} bats and ${this.options.numPits} pits scattered throughout the cave, and your\n
quiver holds ${this.options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n`);
    }

    private printRoom(room: WumpusRoom) {
        console.log(`You are in room ${room.getRoomNumber()} of the cave`);
        
        let neighbors: WumpusRoom[] = room.getNeighbors();
        this.printNeighbors(neighbors);

    }

    private printNeighbors(neighbors: WumpusRoom[])
    {
        if(neighbors.length > 0) {
            console.log(`There are tunnels to rooms ${neighbors[0]}`);
            for(let i = 0; i < neighbors.length; i++) {
                console.log(`, ${neighbors[i]}`);
            }
        }
    }
}