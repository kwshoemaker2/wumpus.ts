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

    it('has rooms with neighbors connected back to it', function() {
        let rooms: WumpusRoom[] = CaveCreator.createCave(options);

        // Depending on the cave layout, there might be one room with a one-way connection
        // to other rooms. There should only be one at the most however.
        let oneWayRooms: WumpusRoom[] = [];
        for(let i = 0; i < rooms.length; i++) {
            const room: WumpusRoom = rooms[i];
            let neighbors: WumpusRoom[] = room.getNeighbors();
            for(let j = 0; j < neighbors.length; j++) {
                let thisNeighbor: WumpusRoom = neighbors[j];
                if(!thisNeighbor.hasNeighbor(room)) {
                    oneWayRooms.push(room);
                }
            }
        }

        expect(oneWayRooms.length).lte(1);
    });
})
