import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import * as GameEvent from './gameEvent'

describe("GameEvent", () => {
    const roomNumber = 10;
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
    });

    function setNextRoom(nextRoom: WumpusRoom, roomNumber: number, callNum: number = 0): void {
        cave.adjacentRoom.withArgs(roomNumber).returns(true);
        cave.getCurrentRoom.onCall(callNum).returns(nextRoom);    
    }

    describe("PlayerMovedToRoomEvents", () => {
        it("moves the player to the room when it's adjacent", () => {
            const nextRoom = tsSinon.stubInterface<WumpusRoom>();
            nextRoom.hasPit.returns(false);
    
            setNextRoom(nextRoom, roomNumber);    
    
            const movePlayer = new GameEvent.PlayerMovedToRoomEvent(roomNumber);
            const nextEvent = movePlayer.perform(cave);
    
            expect(nextEvent).instanceOf(GameEvent.PlayerIdleEvent);
            expect(cave.move.calledOnceWith(roomNumber)).equals(true);
        });
    
        it("returns a fell in pit event when the player enters a room with a pit", () => {
            const nextRoom = tsSinon.stubInterface<WumpusRoom>();
            nextRoom.hasPit.returns(true);
    
            setNextRoom(nextRoom, roomNumber);  
    
            const movePlayer = new GameEvent.PlayerMovedToRoomEvent(roomNumber);
            const nextEvent = movePlayer.perform(cave);
    
            expect(nextEvent).instanceOf(GameEvent.PlayerFellInPitEvent);
        });
    
        it("returns a hit wall event when the player tries to enter a non-adjacent room", () => {
            cave.adjacentRoom.withArgs(roomNumber).returns(false);     
    
            const movePlayer = new GameEvent.PlayerMovedToRoomEvent(roomNumber);
            const nextEvent = movePlayer.perform(cave);
    
            expect(nextEvent).instanceOf(GameEvent.PlayerHitWallEvent);
        });
    
        it("tells player they were moved by bats when they enter a room with bats", () => {
            const nextRoom = tsSinon.stubInterface<WumpusRoom>();
            nextRoom.hasBats.returns(true);
            setNextRoom(nextRoom, roomNumber);  
    
            const movePlayer = new GameEvent.PlayerMovedToRoomEvent(roomNumber);
            const nextEvent = movePlayer.perform(cave);
    
            expect(nextEvent).instanceOf(GameEvent.MovedByBatsEvent);
        });
    });
    
    describe("MovedByBatsEvent", () => {
        it("moves the player to a random room in the cave when they enter a room with bats", () => {
            const roomNumber = 10;
            const nextRoom = tsSinon.stubInterface<WumpusRoom>();
            nextRoom.hasBats.returns(true);
            setNextRoom(nextRoom, roomNumber);
    
            const movedByBats = new GameEvent.MovedByBatsEvent();
            const nextEvent = movedByBats.perform(cave);
    
            expect(nextEvent).instanceOf(GameEvent.PlayerIdleEvent);
            expect(cave.movePlayerToRandomRoom.calledOnce).equals(true);
        });
    });

    describe("PlayerFellInPitEvent", () => {
        it("returns a game over event", () => {
            const playerFellInPit = new GameEvent.PlayerFellInPitEvent();

            const nextEvent = playerFellInPit.perform(cave);

            expect(nextEvent).instanceOf(GameEvent.GameOverEvent);
        });
    });
});

