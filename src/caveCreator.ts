
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'
import { getRandomIntBetween } from './wumpusRandom'
import { WumpusCave, WumpusCaveImpl } from './wumpusCave';
const assert = require('assert').strict;

export const MinRooms: number = 10;
export const DefaultRooms: number = 20;
export const MaxRooms: number = 250;

export const MinDoors: number = 2;
export const DefaultDoors: number = 3;
export const MaxDoors: number = 25;

/**
 * Interface for building the rooms in a Wumpus cave.
 */
export interface RoomsBuilder {
    /**
     * Randomly shuffle the rooms in the cave.
     */
    shuffleRooms();

    /**
     * Build the doors between each room.
     * @param numDoors 
     */
    buildDoors(numDoors: number);

    /**
     * Add pits to the cave.
     */
    addPits(numPits: number);

    /**
     * Add bats to the cave.
     */
    addBats(numBats: number);

    /**
     * Get the built rooms.
     */
    getRooms(): WumpusRoom[];
}

/**
 * Builds the rooms in a Wumpus cave with a configurable number of tunnels, bats, pits, etc.
 * 
 * For the purposes of this implementation, the generated graph has each room connected
 * to the room after it. So 1 -> 2, 2 -> 3, ..., 10 -> 1. This is done to allow for a
 * simpler and easier to verify implementation. Instead randomness is introduced by calling
 * shuffleRooms some number of times before calling other operations like buildDoors,
 * addPits, etc.
 */
export class StandardRoomsBuilder implements RoomsBuilder {
    private rooms: WumpusRoomImpl[];

    public constructor(numRooms: number)
    {
        assert(numRooms >= MinRooms);
        assert(numRooms <= MaxRooms);

        this.rooms = [];

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

    public shuffleRooms() {
        // Implementation of the Fisher-Yates shuffle algorithm.
        const rooms = this.rooms;
        const arrayLen: number = this.rooms.length;
        for(let fromIndex = 0; fromIndex < arrayLen - 1; fromIndex++) {
            let toIndex: number = getRandomIntBetween(fromIndex, arrayLen);
            [rooms[fromIndex], rooms[toIndex]] = [rooms[toIndex], rooms[fromIndex]];
        }
    }

    public buildDoors(numDoors: number) {
        const numRooms = this.rooms.length;
        const maxDoorsForThisCave = numRooms - Math.floor(numRooms / 4);
        assert(numDoors <= maxDoorsForThisCave);
        assert(numDoors >= MinDoors);
        assert(numDoors <= MaxDoors);

        this.makeConnectedNetwork(numDoors);
        this.fillInRestOfNetwork(numDoors);
    }

    /**
     * Makes a network where each room is connected to another.
     */
    private makeConnectedNetwork(numDoors: number) {
        const rooms = this.rooms;
        const numRooms = rooms.length;
        for(let roomNum = 0; roomNum < numRooms; roomNum++) {
            let from: WumpusRoom = rooms[roomNum];
            const nextRoomNum = (roomNum + 1) % numRooms;
            let to: WumpusRoom = rooms[nextRoomNum];

            // This should always be true when making the initial links.
            assert(this.roomHasNeighborsAvailable(numDoors, to));
            assert(this.roomHasNeighborsAvailable(numDoors, from));

            from.addNeighbor(to);
            to.addNeighbor(from);
        }
    }

    /**
     * Create connections between rooms so each has a numDoors number of doors.
     */
    private fillInRestOfNetwork(numDoors: number) {
        const rooms = this.rooms;
        const numRooms = rooms.length;
        for(let fromIndex = 0; fromIndex < numRooms; fromIndex++) {
            const from = rooms[fromIndex];
            let neighborsNeeded = numDoors - from.numNeighbors();
            let toIndex = (fromIndex+1) % numRooms;
            while(toIndex < numRooms && neighborsNeeded > 0) {
                const to = rooms[toIndex];
                if((to !== from) &&
                   this.roomHasNeighborsAvailable(numDoors, to) &&
                   !from.hasNeighbor(to))
                {
                    from.addNeighbor(to);
                    to.addNeighbor(from);
                    neighborsNeeded--;
                }
                toIndex++;
            }

            // If we didn't fill all the neighbors, fill in the rest with one-way connections.
            toIndex = 0;
            while(toIndex < numRooms && neighborsNeeded > 0) {
                const to = rooms[toIndex];
                if(!from.hasNeighbor(to)) {
                    from.addNeighbor(to);
                    neighborsNeeded--;
                }
                toIndex++;
            }
            assert(neighborsNeeded === 0);
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

    public addPits(numPits: number): void {
        const rooms = this.rooms;
        let totalPits: number = 0;
        while(totalPits < numPits) {
            const pitLoc = getRandomIntBetween(0, rooms.length);
            const room = rooms[pitLoc];
            if(!this.roomHasHazard(room)) {
                room.setPit(true);
                totalPits++;
            }
        }
    }

    public addBats(numBats: number): void {
        const rooms = this.rooms;
        let totalBats: number = 0;
        while(totalBats < numBats) {
            const batLoc = getRandomIntBetween(0, rooms.length);
            const room = rooms[batLoc];
            if(!this.roomHasHazard(room)) {
                room.setBats(true);
                totalBats++;
            }
        }
    }

    private roomHasHazard(room: WumpusRoom): boolean {
        return (room.hasPit() || room.hasBats());
    }

    public getRooms(): WumpusRoom[] {
        return this.rooms;
    }
}

/**
 * Creates the Wumpus cave from the game options.
 * @param options The game options.
 * @param builder The builder used to created the cave.
 */
export function createCave(options: WumpusOptions, builder: RoomsBuilder): WumpusCave {
    builder.shuffleRooms();
    builder.buildDoors(options.numDoors);
    builder.addPits(options.numPits);
    builder.addBats(options.numBats);
    
    const rooms = builder.getRooms();
    printCave(rooms);

    return new WumpusCaveImpl(rooms);
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
