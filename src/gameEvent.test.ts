import { expect } from 'chai'
import * as sinon from 'sinon'
import * as tsSinon from 'ts-sinon'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import * as GameEvent from './gameEvent'
import { setRandomRangeFunction } from './wumpusRandom'
import { GameState } from './gameState'

describe("GameEvent", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let gameState: GameState = null;
    let randInt: sinon.SinonStub = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        gameState = new GameState(cave);
        randInt = sinon.stub();
        setRandomRangeFunction(randInt);
    });

    describe("PlayerMovedToRoomEvents", () => {
        const roomNumber = 10;

        it("returns a hit wall event when the player tries to enter a non-adjacent room", () => {
            cave.adjacentRoom.withArgs(roomNumber).returns(false);     
    
            const movePlayer = new GameEvent.PlayerMovedToRoomEvent(roomNumber);
            const nextEvent = movePlayer.perform(gameState);
    
            expect(nextEvent).instanceOf(GameEvent.PlayerHitWallEvent);
        });

        it("moves the player to the room when it's adjacent", () => {
            cave.adjacentRoom.withArgs(roomNumber).returns(true);     
    
            const movePlayer = new GameEvent.PlayerMovedToRoomEvent(roomNumber);
            const nextEvent = movePlayer.perform(gameState);
    
            expect(cave.move.calledOnceWith(roomNumber)).equals(true);
            expect(nextEvent).instanceOf(GameEvent.PlayerEnteredRoomEvent);
        });
    });

    describe("PlayerShotArrowEvent", () => {
        it("decrements the number of arrows value", () => {
            gameState.numArrows = 10;

            const playerShotArrow = new GameEvent.PlayerShotArrowEvent([1]);
            playerShotArrow.perform(gameState);

            expect(gameState.numArrows, "Expected the arrow count to decrement").equals(9);
        });

        it("returns an arrow entered room event if the room is adjacent", () => {
            const shootRoom = 1;

            cave.adjacentRoom.withArgs(shootRoom).returns(true);

            const playerShotArrow = new GameEvent.PlayerShotArrowEvent([1]);
            const nextEvent = playerShotArrow.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.ArrowEnteredRoomEvent);
        });

        it("returns an arrow entered random room event if the room is not adjacent", () => {
            const shootRoom = 1;

            cave.adjacentRoom.withArgs(shootRoom).returns(false);

            const playerShotArrow = new GameEvent.PlayerShotArrowEvent([1]);
            const nextEvent = playerShotArrow.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.ArrowEnteredRandomRoomEvent);
        });


    });

    describe("ArrowEnteredRoomEvent", () => {
        it("returns a player shot wumpus event when the arrow enters the wumpus room", () => {
            const shootRoom = 1;

            const wumpusRoom = tsSinon.stubInterface<WumpusRoom>();
            wumpusRoom.hasWumpus.returns(true);
            cave.getRoom.withArgs(shootRoom).returns(wumpusRoom);

            const arrowEnteredRoom = new GameEvent.ArrowEnteredRoomEvent(shootRoom, []);
            const nextEvent = arrowEnteredRoom.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.PlayerShotWumpusEvent);
        });
    });

    describe("PlayerShotWumpusEvent", () => {
        it("returns a game over event", () => {
            const playerShotWumpus = new GameEvent.PlayerShotWumpusEvent();

            const nextEvent = playerShotWumpus.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.GameOverEvent);
        });
    });

    describe("PlayerEnteredRoomEvent", () => {
        it("returns a player idle event when the entered room has no bats or pits", () => {
            const currentRoom = tsSinon.stubInterface<WumpusRoom>();
            currentRoom.hasPit.returns(false);
            currentRoom.hasBats.returns(false);
            cave.getCurrentRoom.returns(currentRoom);
    
            const playerEnters = new GameEvent.PlayerEnteredRoomEvent();
            const nextEvent = playerEnters.perform(gameState);
    
            expect(nextEvent).instanceOf(GameEvent.PlayerIdleEvent);
        });
    
        it("returns an entered pit room event when the player enters a room with a pit", () => {
            const currentRoom = tsSinon.stubInterface<WumpusRoom>();
            currentRoom.hasPit.returns(true);
            cave.getCurrentRoom.returns(currentRoom);
    
            const playerEnters = new GameEvent.PlayerEnteredRoomEvent();
            const nextEvent = playerEnters.perform(gameState);
    
            expect(nextEvent).instanceOf(GameEvent.PlayerEnteredPitRoomEvent);
        });
    
        it("returns a moved by bats event when they enter a room with bats", () => {
            const currentRoom = tsSinon.stubInterface<WumpusRoom>();
            currentRoom.hasBats.returns(true);
            cave.getCurrentRoom.returns(currentRoom);
    
            const playerEnters = new GameEvent.PlayerEnteredRoomEvent();
            const nextEvent = playerEnters.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.MovedByBatsEvent);
        });

        it("returns an eaten by wumpus event when they enter a room with a wumpus", () => {
            const currentRoom = tsSinon.stubInterface<WumpusRoom>();
            currentRoom.hasWumpus.returns(true);
            cave.getCurrentRoom.returns(currentRoom);
    
            const playerEnters = new GameEvent.PlayerEnteredRoomEvent();
            const nextEvent = playerEnters.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.PlayerEatenByWumpus);
        });
    });
    
    describe("MovedByBatsEvent", () => {
        it("moves the player to a random room in the cave when they enter a room with bats", () => {
            const nextRoom = tsSinon.stubInterface<WumpusRoom>();
            nextRoom.hasBats.returns(true);
            cave.getCurrentRoom.returns(nextRoom);
    
            const movedByBats = new GameEvent.MovedByBatsEvent();
            const nextEvent = movedByBats.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.PlayerEnteredRoomEvent);
            expect(cave.movePlayerToRandomRoom.calledOnce).equals(true);
        });
    });

    describe("PlayerEnteredPitRoomEvent", () => {
        it("makes expect call to getRandomIntBetween", () => {
            const playerEnteredPitRoomEvent = new GameEvent.PlayerEnteredPitRoomEvent();

            playerEnteredPitRoomEvent.perform(gameState);

            expect(randInt.calledOnceWith(0, 5)).equals(true);
        });

        it("returns a player survived pit event 1 out of 6 times", () => {
            const playerEnteredPitRoomEvent = new GameEvent.PlayerEnteredPitRoomEvent();

            randInt.returns(0);
            let nextEvent = playerEnteredPitRoomEvent.perform(gameState);
            expect(nextEvent).instanceOf(GameEvent.PlayerSurvivedPitEvent);
        });

        it("returns a player fell in pit event 5 out of 6 times", () => {
            const playerEnteredPitRoomEvent = new GameEvent.PlayerEnteredPitRoomEvent();

            randInt.returns(1);
            let nextEvent = playerEnteredPitRoomEvent.perform(gameState);
            expect(nextEvent).instanceOf(GameEvent.PlayerFellInPitEvent);

            randInt.returns(2);
            nextEvent = playerEnteredPitRoomEvent.perform(gameState);
            expect(nextEvent).instanceOf(GameEvent.PlayerFellInPitEvent);

            randInt.returns(3);
            nextEvent = playerEnteredPitRoomEvent.perform(gameState);
            expect(nextEvent).instanceOf(GameEvent.PlayerFellInPitEvent);

            randInt.returns(4);
            nextEvent = playerEnteredPitRoomEvent.perform(gameState);
            expect(nextEvent).instanceOf(GameEvent.PlayerFellInPitEvent);

            randInt.returns(5);
            nextEvent = playerEnteredPitRoomEvent.perform(gameState);
            expect(nextEvent).instanceOf(GameEvent.PlayerFellInPitEvent);
        });
    });

    describe("PlayerFellInPitEvent", () => {
        it("returns a game over event", () => {
            const playerFellInPit = new GameEvent.PlayerFellInPitEvent();

            const nextEvent = playerFellInPit.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.GameOverEvent);
        });
    });

    describe("PlayerEatenByWumpus", () => {
        it("returns a game over event", () => {
            const PlayerEatenByWumpus = new GameEvent.PlayerEatenByWumpus();

            const nextEvent = PlayerEatenByWumpus.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.GameOverEvent);
        });
    });
});

