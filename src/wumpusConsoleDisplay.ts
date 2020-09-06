
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusOptions } from './wumpusOptions'

/**
 * WumpusDisplay implementation that outputs to the console.
 */
export class WumpusConsoleDisplay implements WumpusDisplay {
    public showIntroduction(options: WumpusOptions): void {
        console.log(`Hunt the Wumpus!

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.\n
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your\n
quiver holds ${options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n`);
    }

    public showRoomEntry(room: WumpusRoom): void {
        this.printRoom(room);
        this.printNeighbors(room.getNeighbors());
    }

    private printRoom(room: WumpusRoom) {
        console.log(`You are in room ${room.getRoomNumber()} of the cave`);
        
        let neighbors: WumpusRoom[] = room.getNeighbors();
        this.printNeighbors(neighbors);

    }

    private printNeighbors(neighbors: WumpusRoom[])
    {
        if(neighbors.length > 0) {
            console.log(`There are tunnels to rooms ${neighbors[0].getRoomNumber()}`);
            for(let i = 1; i < neighbors.length; i++) {
                console.log(`, ${neighbors[i].getRoomNumber()}`);
            }
        }
    }
}
