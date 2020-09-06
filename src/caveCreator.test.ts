import { expect } from 'chai';
import { WumpusOptions } from './wumpusOptions'
import { CaveCreator } from './caveCreator'
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'

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

    it('has unique neighbors in each room', function() {
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
})
