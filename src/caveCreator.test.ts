import { expect } from 'chai';
import { WumpusOptions } from './wumpusOptions'
import { CaveCreator, CaveBuilder } from './caveCreator'
import { WumpusRoom } from './wumpusRoom'

describe('CaveBuilder', () => {
    it('initializes the array of rooms ordered from 1..n', () => {
        const numRooms = 5;
        const builder = new CaveBuilder(5);
        const rooms = builder.getRooms();

        expect(rooms[0].getRoomNumber()).equals(1);
        expect(rooms[1].getRoomNumber()).equals(2);
        expect(rooms[2].getRoomNumber()).equals(3);
        expect(rooms[3].getRoomNumber()).equals(4);
        expect(rooms[4].getRoomNumber()).equals(5);
    });

    it('shuffles the rooms to different parts of the array', () => {

    });
});

xdescribe('CaveCreator', () => {
    const options: WumpusOptions = new WumpusOptions();

    it('has the options.numRooms number of rooms', function() {
        let rooms: WumpusRoom[] = CaveCreator.createCave(options);
        expect(rooms.length).equal(options.numRooms);
    });

    it('has rooms that each have options.numDoors number of neighbors', function() {
        let rooms: WumpusRoom[] = CaveCreator.createCave(options);
        for(let i = 0; i < rooms.length; i++) {
            let room: WumpusRoom = rooms[i];
            expect(room.numNeighbors()).equals(options.numDoors);
        }
    });

    // TODO this test sometimes fails.
    // Need to not use the real random number generator, and figure out what conditions it fails under.
    xit('has unique neighbors in each room', function() {
        let rooms: WumpusRoom[] = CaveCreator.createCave(options);
        for(let i = 0; i < rooms.length; i++) {
            let neighbors: WumpusRoom[] = rooms[i].getNeighbors();
            for(let j = 0; j < neighbors.length; j++) {
                let thisNeighbor: WumpusRoom = neighbors[j];
                for(let k = j+1; k < neighbors.length; k++) {
                    let otherNeighbor: WumpusRoom = neighbors[k];
                    expect(thisNeighbor).not.equals(otherNeighbor);
                }
            }
        }
    });

    it('creates a cave with options.numPits number of pits', function() {
        let rooms: WumpusRoom[] = CaveCreator.createCave(options);
        let numPits: number = 0;

        for(let i = 0; i < rooms.length; i++) {
            if(rooms[i].hasPit()) { numPits++; }
        }

        expect(numPits).equals(options.numPits);
    });

    it('creates a cave with options.numBats number of bats', function() {
        let rooms: WumpusRoom[] = CaveCreator.createCave(options);
        let numBats: number = 0;

        for(let i = 0; i < rooms.length; i++) {
            if(rooms[i].hasBats()) { numBats++; }
        }

        expect(numBats).equals(options.numBats);
    });

    it('does not have bats and pits in the same room', function() {
        let rooms: WumpusRoom[] = CaveCreator.createCave(options);

        for(let i = 0; i < rooms.length; i++) {
            const hasBoth = (rooms[i].hasBats() && rooms[i].hasPit());
            expect(hasBoth).equals(false);
        }
    });
});
