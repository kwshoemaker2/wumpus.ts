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

    it('shuffles the rooms to different parts of the array', () => {
        const numRooms = 10;

        const randInt = sinon.stub();
        const builder = new CaveBuilder(numRooms);
        builder.setRandomRangeFunction(randInt);

        const roomOrder = [1, 3, 5, 7, 9, 2, 4, 6, 8];
        for(let callNum = 0; callNum < roomOrder.length; callNum++) {
            const roomNum = roomOrder[callNum] - 1;
            randInt.onCall(callNum).returns(roomNum);
        }

        builder.shuffleRooms();

        const rooms = builder.getRooms();
        expect(rooms[0].getRoomNumber()).equals(1);
        expect(rooms[1].getRoomNumber()).equals(6);
        expect(rooms[2].getRoomNumber()).equals(5);
        expect(rooms[3].getRoomNumber()).equals(4);
        expect(rooms[4].getRoomNumber()).equals(9);
        expect(rooms[5].getRoomNumber()).equals(8);
        expect(rooms[6].getRoomNumber()).equals(7);
        expect(rooms[7].getRoomNumber()).equals(2);
        expect(rooms[8].getRoomNumber()).equals(3);
        expect(rooms[9].getRoomNumber()).equals(10);
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

