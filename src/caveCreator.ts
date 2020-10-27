
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'
import { getRandomIntBetween, RandomRangeFunction } from './wumpusUtils'
const assert = require('assert').strict;

/**
 * Builds a Wumpus cave with a configurable number of rooms, 
 * tunnels, bats, pits, etc.
 */
export class CaveBuilder {
    private rooms: WumpusRoomImpl[];
    private numberOfPits: number;
    private numberOfBats: number;
    private randRangeFunction: RandomRangeFunction = getRandomIntBetween;

    public constructor(numRooms: number)
    {
        this.rooms = [];
        this.numberOfPits = 0;
        this.numberOfBats = 0;

        this.initRooms(numRooms);
    }

    private initRooms(numRooms: number)
    {
        for(let i = 0; i < numRooms; i++)
        {
            const roomNum = i + 1;
            this.rooms.push(new WumpusRoomImpl(roomNum));
        }
    }

    /**
     * Override the default random range function.
     */
    public setRandomRangeFunction(randRangeFunction: RandomRangeFunction): void {
        this.randRangeFunction = randRangeFunction;
    }

    /**
     * Randomly shuffle the rooms in the cave.
     */
    public shuffleRooms() {
        // Implementation of the Fisher-Yates shuffle algorithm.
        const rooms = this.rooms;
        const arrayLen: number = this.rooms.length;
        for(let fromIndex = 0; fromIndex < arrayLen - 1; fromIndex++) {
            let toIndex: number = getRandomIntBetween(fromIndex, arrayLen);
            [rooms[fromIndex], rooms[toIndex]] = [rooms[toIndex], rooms[fromIndex]];
        }
    }

    /**
     * Build the doors between each room.
     * @param numDoors 
     */
    public buildDoors(numDoors: number) {
        // TODO This is the generation algorithm from an older version.
        // This should be updated to the newer one.
        this.makeConnectedNetwork(numDoors);
        this.fillInRestofNetwork(numDoors);
    }

    /**
     * Makes a network where each room is connected to another.
     */
    private makeConnectedNetwork(numDoors: number) {
        const rooms = this.rooms;
        for(let i = 1; i < rooms.length; i++) {
            let from: WumpusRoom = rooms[i];
            let to: WumpusRoom = null;
            do {
                to = rooms[getRandomIntBetween(0, i)];
            } while(from.hasNeighbor(to) || !this.roomHasNeighborsAvailable(numDoors, to));
            from.addNeighbor(to);
            to.addNeighbor(from);
        }
    }

    /**
     * Fill in any extra rooms on the cave network.
     */
    private fillInRestofNetwork(numDoors: number) {
        // TODO there's a bug in here where a duplicate room is placed occasionally.
        const rooms = this.rooms;
        for(let fromIndex = 0; fromIndex < rooms.length; fromIndex++) {
            let from: WumpusRoom = rooms[fromIndex];
            while(this.roomHasNeighborsAvailable(numDoors, from)) {
                let to: WumpusRoom = null;
                for(let toIndex = fromIndex+1; toIndex < rooms.length; toIndex++) {
                    to = rooms[toIndex];
                    if(this.roomHasNeighborsAvailable(numDoors, to) && !to.hasNeighbor(from)) {
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
    private roomHasNeighborsAvailable(maxNeighbors: number, room: WumpusRoom): boolean {
        return room.numNeighbors() < maxNeighbors;
    }

    /**
     * Add pits to the cave.
     */
    public addPits(numPits: number): void {
        const rooms = this.rooms;
        while(this.numberOfPits < numPits) {
            const pitLoc = getRandomIntBetween(0, rooms.length);
            const room = rooms[pitLoc];
            if(!room.hasPit() && !room.hasPit()) {
                room.setPit(true);
                this.numberOfPits++;
            }
        }
    }

    /**
     * Add bats to the cave.
     */
    public addBats(numBats: number): void {
        const rooms = this.rooms;
        while(this.numberOfBats < numBats) {
            const batLoc = getRandomIntBetween(0, rooms.length);
            const room = rooms[batLoc];
            if(!room.hasBats() && !room.hasPit()) {
                room.setBats(true);
                this.numberOfBats++;
            }
        }
    }

    public getRooms(): WumpusRoom[] {
        return this.rooms;
    }
}

/**
 * Static class that creates the cave for Hunt the Wumpus.
 */
export class CaveCreator {
    /**
     * Creates the Wumpus cave from the game options.
     * @param options The game options.
     */
    public static createCave(options: WumpusOptions): WumpusRoom[] {
        const builder = new CaveBuilder(options.numRooms);
        builder.shuffleRooms();
        builder.buildDoors(options.numDoors);
        builder.addPits(options.numPits);
        builder.addBats(options.numBats);
        
        const rooms = builder.getRooms();
        //printCave(rooms);
        return rooms;
    }
}

/**
* Print the cave layout in a graphviz format.
* @param rooms The rooms of the cave.
*/
function printCave(rooms: WumpusRoom[]) {
    let s: string = "digraph {\n";
    for(let i = 0; i < rooms.length; i++) {
        let room: WumpusRoom = rooms[i];
        let roomNumber: number = room.getRoomNumber();
        s += `${roomNumber}`

        if(room.hasPit()) {
            s += '[fillColor="black" fontColor="white"]'
        }

        s += ";\n";
 
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
