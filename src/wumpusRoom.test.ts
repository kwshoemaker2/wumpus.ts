import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'

describe("WumpusRoomImpl", () => {
    const roomNumber = 10;
    let room: WumpusRoomImpl;

    beforeEach(() => {
        room = new WumpusRoomImpl(roomNumber);
    });

    function makeStubRoom(): tsSinon.StubbedInstance<WumpusRoom> {
        return tsSinon.stubInterface<WumpusRoom>();
    }

    it("returns the expected room number", () => {
        expect(room.getRoomNumber()).equals(roomNumber);
    });

    it("does not have bats by default", () => {
        expect(room.hasBats()).equals(false);
    });

    it("correctly indicates whether it has bats", () => {
        room.setBats(false);
        expect(room.hasBats()).equals(false);
        room.setBats(true);
        expect(room.hasBats()).equals(true);
    });

    it("does not have a pit by default", () => {
        expect(room.hasPit()).equals(false);
    });

    it("correctly indicates whether it has a pit", () => {
        room.setBats(false);
        expect(room.hasBats()).equals(false);
        room.setBats(true);
        expect(room.hasBats()).equals(true);
    });

    it("correctly indicates whether it has a Wumpus", () => {
        room.setWumpus(false);
        expect(room.hasWumpus()).equals(false);
        room.setWumpus(true);
        expect(room.hasWumpus()).equals(true);
    });

    it("has no neighbors by default", () => {
        expect(room.numNeighbors()).equals(0);
        expect(room.getNeighbors().length).equals(0);
    });

    it("says it has a neighbor when a neighbor with the same room number was added", () => {
        const neighbor = makeStubRoom();
        neighbor.getRoomNumber.returns(roomNumber + 1);
        room.addNeighbor(neighbor);

        expect(room.hasNeighbor(neighbor)).equals(true);
    });

    it("says it has a neighbor when a neighbor with the same room number was not added", () => {
        const neighbor1 = makeStubRoom();
        neighbor1.getRoomNumber.returns(roomNumber + 1);
        const neighbor2 = makeStubRoom();
        neighbor2.getRoomNumber.returns(roomNumber + 2);
        room.addNeighbor(neighbor1);

        expect(room.hasNeighbor(neighbor2)).equals(false);
    });

    it("says a pit is nearby when a neighbor contains a pit", () => {
        const neighbor1 = makeStubRoom();
        neighbor1.hasPit.returns(false);
        room.addNeighbor(neighbor1);

        const neighbor2 = makeStubRoom();
        neighbor2.hasPit.returns(true);        
        room.addNeighbor(neighbor2);

        expect(room.pitNearby()).equals(true);
    });

    it("says a pit is not nearby when no neighbors contain a pit", () => {
        const neighbor1 = makeStubRoom();
        neighbor1.hasPit.returns(false);
        room.addNeighbor(neighbor1);

        const neighbor2 = makeStubRoom();
        neighbor2.hasPit.returns(false);        
        room.addNeighbor(neighbor2);

        expect(room.pitNearby()).equals(false);
    });

    it("says bats are nearby when a neighbor contains bats", () => {
        const neighbor1 = makeStubRoom();
        neighbor1.hasBats.returns(false);
        room.addNeighbor(neighbor1);

        const neighbor2 = makeStubRoom();
        neighbor2.hasBats.returns(true);        
        room.addNeighbor(neighbor2);

        expect(room.batsNearby()).equals(true);
    });

    it("says bats are not nearby when no neighbors contain bats", () => {
        const neighbor1 = makeStubRoom();
        neighbor1.hasBats.returns(false);
        room.addNeighbor(neighbor1);

        const neighbor2 = makeStubRoom();
        neighbor2.hasBats.returns(false);        
        room.addNeighbor(neighbor2);

        expect(room.batsNearby()).equals(false);
    });

    it("says a wumpus is nearby when a neighbor contains a wumpus", () => {
        const neighbor1 = makeStubRoom();
        neighbor1.hasWumpus.returns(false);
        room.addNeighbor(neighbor1);

        const neighbor2 = makeStubRoom();
        neighbor2.hasWumpus.returns(true);        
        room.addNeighbor(neighbor2);

        expect(room.wumpusNearby()).equals(true);
    });

    it("says a wumpus is not nearby when no neighbors contain a wumpus", () => {
        const neighbor1 = makeStubRoom();
        neighbor1.hasWumpus.returns(false);
        room.addNeighbor(neighbor1);

        const neighbor2 = makeStubRoom();
        neighbor2.hasWumpus.returns(false);        
        room.addNeighbor(neighbor2);

        expect(room.hasWumpus()).equals(false);
    });

    it("indicates the correct number of neighbors", () => {
        const neighbor1 = makeStubRoom();
        room.addNeighbor(neighbor1);

        const neighbor2 = makeStubRoom();
        room.addNeighbor(neighbor2);

        expect(room.numNeighbors()).equals(2);
    });

    it("returns the array of neighbors sorted", () => {

        const neighbor3 = makeStubRoom();
        neighbor3.getRoomNumber.returns(3);
        room.addNeighbor(neighbor3);

        const neighbor2 = makeStubRoom();
        neighbor2.getRoomNumber.returns(2);
        room.addNeighbor(neighbor2);

        const neighbor1 = makeStubRoom();
        neighbor1.getRoomNumber.returns(1);
        room.addNeighbor(neighbor1);

        const neighbor4 = makeStubRoom();
        neighbor4.getRoomNumber.returns(4);
        room.addNeighbor(neighbor4);

        const neighbors = room.getNeighbors();

        expect(neighbors.length).equals(4);
        expect(neighbors[0].getRoomNumber(), "Expect neighbor 1 as the first element").equals(1);
        expect(neighbors[1].getRoomNumber(), "Expect neighbor 2 as the second element").equals(2);
        expect(neighbors[2].getRoomNumber(), "Expect neighbor 3 as the third element").equals(3);
        expect(neighbors[3].getRoomNumber(), "Expect neighbor 4 as the fourth element").equals(4);
    });
});