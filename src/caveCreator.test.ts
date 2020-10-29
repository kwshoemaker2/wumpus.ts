import { expect } from 'chai';
import { WumpusOptions } from './wumpusOptions'
import { CaveCreator, CaveBuilder, MinRooms, printCave, MaxRooms, MaxDoors, DefaultRooms, DefaultDoors } from './caveCreator'
import { WumpusRoom } from './wumpusRoom'
import { RandomRangeFunction } from './wumpusUtils';
import * as sinon from 'sinon';

describe('CaveBuilder', () => {

    /**
     * Asserts that the rooms form a connected graph.
     */
    function checkIfRoomsAreConnectedNetwork(rooms: WumpusRoom[]) {
        const numRooms = rooms.length;
        for(let i = 0; i < numRooms; i++) {
            const thisRoom = rooms[i];
            const nextRoom = rooms[(i+1) % numRooms];
            expect(thisRoom.hasNeighbor(nextRoom)).equals(true);
            expect(nextRoom.hasNeighbor(thisRoom)).equals(true);
        }
    }

    function roomsHaveExpectedNumberOfNeighbors(rooms: WumpusRoom[], numDoors: number) {
        for(let i = 0; i < rooms.length; i++) {
            expect(rooms[i].getNeighbors().length, `failed for room ${i+1}`).equals(numDoors);
        }
    }

    function roomsHaveUniqueNeighbors(rooms: WumpusRoom[]) {
        for(let i = 0; i < rooms.length; i++) {
            const neighbors = rooms[i].getNeighbors();
            const duplicates = ((new Set(neighbors)).size != neighbors.length);
            expect(duplicates, `failed for room ${i+1}`).equals(false);
        }
    }

    it('initializes the array of rooms ordered from 1..n', () => {
        const numRooms = MinRooms;
        const builder = new CaveBuilder(numRooms);
        const rooms = builder.getRooms();

        expect(rooms[0].getRoomNumber()).equals(1);
        expect(rooms[numRooms - 1].getRoomNumber()).equals(numRooms);
    });

    xit('shuffles the rooms to different parts of the array', () => {
        // TODO
    });

    it('builds a connected network out of the rooms', () => {
        const numRooms = MinRooms;
        const numDoors = 3;

        const builder = new CaveBuilder(numRooms);
        builder.buildDoors(numDoors);
        const rooms = builder.getRooms();
        checkIfRoomsAreConnectedNetwork(rooms);
    });

    it('does not build more than one door between rooms (11 rooms, 3 doors)', () => {
        const numRooms = 11;
        const numDoors = 3;

        const builder = new CaveBuilder(numRooms);
        builder.buildDoors(numDoors);
        const rooms = builder.getRooms();

        roomsHaveUniqueNeighbors(rooms);
    });

    it('builds the correct number of doors between rooms (11 rooms, 3 doors)', () => {
        const numRooms = 11;
        const numDoors = 3;

        const builder = new CaveBuilder(numRooms);
        builder.buildDoors(numDoors);
        const rooms = builder.getRooms();

        roomsHaveExpectedNumberOfNeighbors(rooms, numDoors);
    });

    it('does not build more than one door between rooms (11 rooms, 4 doors)', () => {
        const numRooms = 11;
        const numDoors = 4;

        const builder = new CaveBuilder(numRooms);
        builder.buildDoors(numDoors);
        const rooms = builder.getRooms();

        roomsHaveUniqueNeighbors(rooms);
    });

    it('follows conditions for 10 room 7 door cave', () => {
        const numRooms = 10;
        const numDoors = 7;

        const builder = new CaveBuilder(numRooms);
        builder.buildDoors(numDoors);
        const rooms = builder.getRooms();

        checkIfRoomsAreConnectedNetwork(rooms);
        roomsHaveExpectedNumberOfNeighbors(rooms, numDoors);
        roomsHaveUniqueNeighbors(rooms);
    });

    it('follows conditions for the max number of rooms and doors', () => {
        const numRooms = MaxRooms;
        const numDoors = MaxDoors;

        const builder = new CaveBuilder(numRooms);
        builder.buildDoors(numDoors);
        const rooms = builder.getRooms();

        checkIfRoomsAreConnectedNetwork(rooms);
        roomsHaveExpectedNumberOfNeighbors(rooms, numDoors);
        roomsHaveUniqueNeighbors(rooms);
    });

    it('adds pits to random rooms in the cave', () => {
        const numRooms = DefaultRooms;

        const randInt = sinon.stub();
        randInt.onCall(0).returns(1);
        randInt.onCall(1).returns(3);
        randInt.onCall(2).returns(5);

        const builder = new CaveBuilder(numRooms);
        builder.setRandomRangeFunction(randInt);

        builder.addPits(3);
        const rooms = builder.getRooms();

        expect(rooms[1].hasPit(), "The room should have a pit").equals(true);
        expect(rooms[3].hasPit(), "The room should have a pit").equals(true);
        expect(rooms[5].hasPit(), "The room should have a pit").equals(true);
    });

    it('does not add pit if the room already has one', () => {
        const numRooms = DefaultRooms;

        const randInt = sinon.stub();
        randInt.onCall(0).returns(1);
        randInt.onCall(1).returns(1);
        randInt.onCall(2).returns(3);

        const builder = new CaveBuilder(numRooms);
        builder.setRandomRangeFunction(randInt);

        builder.addPits(2);
        const rooms = builder.getRooms();

        expect(rooms[1].hasPit(), "The room should have a pit").equals(true);
        expect(rooms[3].hasPit(), "The room should have a pit").equals(true);
    });

    it('does not add a pit if the room has bats', () => {
        const numRooms = DefaultRooms;

        const randInt = sinon.stub();
        randInt.onCall(0).returns(1);
        randInt.onCall(1).returns(1);
        randInt.onCall(2).returns(2);

        const builder = new CaveBuilder(numRooms);
        builder.setRandomRangeFunction(randInt);

        builder.addBats(1);
        builder.addPits(1);

        const rooms = builder.getRooms();
        expect(rooms[1].hasBats(), "The room should have bats").equals(true);
        expect(rooms[1].hasPit(), "The room should not have a pit").equals(false);
    });

    it('adds bats to random rooms in the cave', () => {
        const numRooms = DefaultRooms;

        const randInt = sinon.stub();
        randInt.onCall(0).returns(1);
        randInt.onCall(1).returns(3);
        randInt.onCall(2).returns(5);

        const builder = new CaveBuilder(numRooms);
        builder.setRandomRangeFunction(randInt);

        builder.addBats(3);
        const rooms = builder.getRooms();

        expect(rooms[1].hasBats(), "The room should have bats").equals(true);
        expect(rooms[3].hasBats(), "The room should have bats").equals(true);
        expect(rooms[5].hasBats(), "The room should have bats").equals(true);
    });

    it('does not add bats if the room already has one', () => {
        const numRooms = DefaultRooms;

        const randInt = sinon.stub();
        randInt.onCall(0).returns(1);
        randInt.onCall(1).returns(1);
        randInt.onCall(2).returns(3);

        const builder = new CaveBuilder(numRooms);
        builder.setRandomRangeFunction(randInt);

        builder.addBats(2);
        const rooms = builder.getRooms();

        expect(rooms[1].hasBats(), "The room should have bats").equals(true);
        expect(rooms[3].hasBats(), "The room should have bats").equals(true);
    });

    it('does not add bats if the room already has a pit', () => {
        const numRooms = DefaultRooms;

        const randInt = sinon.stub();
        randInt.onCall(0).returns(1);
        randInt.onCall(1).returns(1);
        randInt.onCall(2).returns(3);

        const builder = new CaveBuilder(numRooms);
        builder.setRandomRangeFunction(randInt);

        builder.addPits(1);
        builder.addBats(1);
        const rooms = builder.getRooms();

        expect(rooms[1].hasPit(), "The room should have a pit").equals(true);
        expect(rooms[1].hasBats(), "The room should not have bats").equals(false);
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
