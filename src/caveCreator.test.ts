import { expect } from 'chai';
import { WumpusOptions } from './wumpusOptions'
import { CaveCreator } from './caveCreator'
import { WumpusRoom } from './wumpusRoom'

describe('CaveCreator.createCave tests', function() {
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
})
