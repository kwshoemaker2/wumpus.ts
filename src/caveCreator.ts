
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'
import { getRandomIntBetween } from './wumpusUtils'

/**
 * Static class that creates the cave for Hunt the Wumpus.
 */
export class CaveCreator {
    /**
     * Creates the Wumpus cave from the game options.
     * @param options The game options.
     */
    public static createCave(options: WumpusOptions): WumpusRoom[] {
        let rooms: WumpusRoom[] = CaveCreator.initRooms(options.numRooms);
        CaveCreator.shuffleRooms(rooms);
        CaveCreator.makeConnectedNetwork(options, rooms);
        CaveCreator.fillInRestofNetwork(options, rooms);
        
        // Uncomment this to get a graphviz printout
        //this.printCave(rooms);
        return rooms;
    }

    /**
     * Create an array of WumpusRoom objects numbered 1..numRooms.
     * @param numRooms The number of rooms in the cave.
     */
    private static initRooms(numRooms: number): WumpusRoom[] {
        let rooms: WumpusRoom[] = [];

        for(let i = 0; i < numRooms; i++)
        {
            const roomNum = i + 1;
            rooms.push(new WumpusRoomImpl(roomNum));
        }

        return rooms;
    }

    /**
     * Shuffle the rooms array randomly.
     * @param rooms The rooms to shuffle.
     */
    private static shuffleRooms(rooms: WumpusRoom[]) {
        // Implementation of the Fisher-Yates shuffle algorithm.
        let arrayLen: number = rooms.length;
        for(let fromIndex = 0; fromIndex < arrayLen - 1; fromIndex++) {
            let toIndex: number = getRandomIntBetween(fromIndex, arrayLen);
            [rooms[fromIndex], rooms[toIndex]] = [rooms[toIndex], rooms[fromIndex]];
        }
    }

    /**
     * Makes a network where each room is connected to another.
     * @param rooms The array of rooms to connect.
     */
    private static makeConnectedNetwork(options: WumpusOptions, rooms: WumpusRoom[]) {
        for(let i = 1; i < rooms.length; i++) {
            let from: WumpusRoom = rooms[i];
            let to: WumpusRoom = null;
            do {
                to = rooms[getRandomIntBetween(0, i)];
            } while(from.hasNeighbor(to) || !this.roomHasNeighborsAvailable(options.numDoors, to));
            from.addNeighbor(to);
            to.addNeighbor(from);
        }
    }

    /**
     * Fill in any extra rooms on the cave network.
     * @param options 
     * @param rooms 
     */
    private static fillInRestofNetwork(options: WumpusOptions, rooms: WumpusRoom[]) {
        // TODO there's a bug in here where a duplicate room is placed occasionally.
        for(let fromIndex = 0; fromIndex < rooms.length; fromIndex++) {
            let from: WumpusRoom = rooms[fromIndex];
            while(this.roomHasNeighborsAvailable(options.numDoors, from)) {
                let to: WumpusRoom = null;
                for(let toIndex = fromIndex+1; toIndex < rooms.length; toIndex++) {
                    to = rooms[toIndex];
                    if(this.roomHasNeighborsAvailable(options.numDoors, to) && !to.hasNeighbor(from)) {
                        break;
                    } else {
                        to = null;
                    }
                }

                if(to != null) {
                    from.addNeighbor(to);
                    to.addNeighbor(from);
                } else {
                    // The last room may end up with two free slots; make them one-way
                    to = rooms[getRandomIntBetween(0, fromIndex)];
                    from.addNeighbor(to);
                }
            }
        }
    }

    /**
     * Determines if the room can add a neighbor.
     * @param maxNeighbors The max number of neighbors a room can have.
     * @param room The room being checked.
     */
    private static roomHasNeighborsAvailable(maxNeighbors: number, room: WumpusRoom): boolean {
        return room.numNeighbors() < maxNeighbors;
    }
}

/**
* Print the cave layout in a graphviz format.
* @param rooms The rooms of the cave.
*/
export function printCave(rooms: WumpusRoom[]) {
   let s: string = "digraph {\n";
   for(let i = 0; i < rooms.length; i++) {
       let room: WumpusRoom = rooms[i];
       let roomNumber: number = room.getRoomNumber();
       s += `${roomNumber};\n`

       let neighbors: WumpusRoom[] = room.getNeighbors();
       if(neighbors.length > 0) {
           for(let j = 0; j < neighbors.length; j++) {
               s += `${roomNumber} -> ${neighbors[j].getRoomNumber()};\n`;
           }
       }

   }
   s += "}";
   console.log(s);
}
