import { expect } from 'chai'
import * as sinon from 'sinon'
import * as tsSinon from 'ts-sinon'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import * as GameEvent from './gameEvent'
import { setRandomRangeFunction } from './wumpusRandom'
import { GameState } from './gameState'

type WumpusRoomStub = tsSinon.StubbedInstance<WumpusRoom>;
type WumpusCaveStub = tsSinon.StubbedInstance<WumpusCave>;

/**
 * Helps with stubbing the internals of a WumpusCave and WumpusRooms.
 */
class WumpusCaveStubber {
    private cave: WumpusCaveStub;

    public constructor(cave: WumpusCaveStub) {
        this.cave = cave;
    }

    public createWumpusRoomStub(roomNum: number): WumpusRoomStub {
        const result = tsSinon.stubInterface<WumpusRoom>();
        result.getRoomNumber.returns(roomNum);
        return result;
    }

    public addRoomToCave(roomNum: number, room: WumpusRoom) {
        this.cave.getRoom.withArgs(roomNum).returns(room);
    }

    public connectRooms(fromRoom: WumpusRoomStub, toRoom: WumpusRoomStub) {
        fromRoom.hasNeighbor.withArgs(toRoom).returns(true);
    }

    public disconnectRooms(fromRoom: WumpusRoomStub, toRoom: WumpusRoomStub) {
        fromRoom.hasNeighbor.withArgs(toRoom).returns(false);
    }

    public setCurrentRoom(currentRoom: WumpusRoomStub) {
        this.cave.getCurrentRoom.returns(currentRoom);
    }

    /**
     * Set up a chain of rooms that the user tells the arrow to shoot into.
     * 
     * Returns the last room in the chain.
     */
    public setUpRoomChain(firstRoomNum: number, chainRoomNumbers: number[]): WumpusRoomStub {
        let fromRoom = this.createWumpusRoomStub(firstRoomNum);

        this.addRoomToCave(firstRoomNum, fromRoom);
        for(let i = 0; i < chainRoomNumbers.length; i++) {
            const toRoom = this.createWumpusRoomStub(chainRoomNumbers[i]);
            this.addRoomToCave(chainRoomNumbers[i], toRoom);
            this.connectRooms(fromRoom, toRoom);
            fromRoom = toRoom;
        }

        return fromRoom;
    }

    /**
     * Set up a chain of rooms that the user tells the arrow to shoot into.
     * The last room in the chain won't be connected.
     * 
     * Returns the last connected room in the chain.
     */
    public setUpBrokenRoomChain(firstRoomNum: number, chainRoomNumbers: number[]): WumpusRoomStub {
        let fromRoom = this.createWumpusRoomStub(firstRoomNum);
        let toRoom: tsSinon.StubbedInstance<WumpusRoom> = null;

        // Add the rooms to the cave and connect them in a chain.
        this.addRoomToCave(firstRoomNum, fromRoom);
        for(let i = 0; i < chainRoomNumbers.length - 1; i++) {
            toRoom = this.createWumpusRoomStub(chainRoomNumbers[i]);
            this.addRoomToCave(chainRoomNumbers[i], toRoom);
            this.connectRooms(fromRoom, toRoom);
            fromRoom = toRoom;
        }

        // Make the last room in the chain disconnected.
        toRoom = this.createWumpusRoomStub(chainRoomNumbers[chainRoomNumbers.length - 1]);
        this.addRoomToCave(chainRoomNumbers[chainRoomNumbers.length - 1], toRoom);
        this.disconnectRooms(fromRoom, toRoom);

        return fromRoom;
    }

    public addNeighbors(room: WumpusRoomStub, neighborRoomNums: number[]): WumpusRoomStub[] {
        const neighbors = [];
        for(let i = 0; i < neighborRoomNums.length; i++) {
            const neighbor = this.createWumpusRoomStub(neighborRoomNums[i]);
            neighbors.push(neighbor);
            this.addRoomToCave(neighborRoomNums[i], neighbors[i]);
        }

        room.getNeighbors.returns(neighbors);

        return neighbors;
    }
}

describe("GameEvent", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let caveStubber: WumpusCaveStubber = null;
    let gameState: GameState = null;
    let randInt: sinon.SinonStub = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        caveStubber = new WumpusCaveStubber(cave);
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
        const currentRoomNum = 1;
        const shootRoomNum = 2;

        let currentRoom: WumpusRoomStub = null;
        let shootRoom: WumpusRoomStub = null;

        beforeEach(() => {
            currentRoom = caveStubber.createWumpusRoomStub(currentRoomNum);
            caveStubber.addRoomToCave(currentRoomNum, currentRoom);
            caveStubber.setCurrentRoom(currentRoom);

            shootRoom = caveStubber.createWumpusRoomStub(shootRoomNum);
            caveStubber.addRoomToCave(shootRoomNum, shootRoom);
        });

        it("decrements the number of arrows value", () => {
            gameState.numArrows = 10;
            cave.adjacentRoom.withArgs(shootRoomNum).returns(true);

            const playerShotArrow = new GameEvent.PlayerShotArrowEvent([shootRoomNum]);
            playerShotArrow.perform(gameState);

            expect(gameState.numArrows, "Expected the arrow count to decrement").equals(9);
        });

        it("returns an arrow entered room event if the room is adjacent", () => {
            cave.adjacentRoom.withArgs(shootRoomNum).returns(true);

            const playerShotArrow = new GameEvent.PlayerShotArrowEvent([shootRoomNum]);
            const nextEvent = playerShotArrow.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.ArrowEnteredRoomEvent);

            const arrowEnteredRoom = nextEvent as GameEvent.ArrowEnteredRoomEvent;
            expect(arrowEnteredRoom.getCurrentRoom(), "Incorrect current room").equals(shootRoomNum);
            expect(arrowEnteredRoom.getEnteredRoom(), "Incorrect next room").equals(undefined);
        });

        it("returns an arrow entered random room event if the room is not adjacent", () => {

            cave.adjacentRoom.withArgs(shootRoomNum).returns(false);

            // Create neighbors in the current room and randomly select one for the arrow to travel to.
            const neighborRoomNums = [100, 200, 300];
            caveStubber.addNeighbors(currentRoom, neighborRoomNums);
            const neighborIdx = 1;
            randInt.returns(neighborIdx);

            const playerShotArrow = new GameEvent.PlayerShotArrowEvent([shootRoomNum]);
            const nextEvent = playerShotArrow.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.ArrowEnteredRandomRoomEvent);

            const arrowEnteredRandRoom = nextEvent as GameEvent.ArrowEnteredRandomRoomEvent;
            expect(arrowEnteredRandRoom.getFromRoom(), "Incorrect from room").equals(currentRoomNum);
            expect(arrowEnteredRandRoom.getToRoom(), "Incorrect to room").equals(shootRoomNum);
            expect(arrowEnteredRandRoom.getEnteredRoom(), "Incorrect next room").equals(neighborRoomNums[neighborIdx]);
        });
    });

    describe("ArrowEnteredRoomEvent", () => {
        function testShootChain(firstRoomNum: number, chainRoomNumbers: number[]): void {
            let theEvent: GameEvent.GameEvent = new GameEvent.ArrowEnteredRoomEvent(firstRoomNum, chainRoomNumbers);
            let currentRoomNum = firstRoomNum;
            let i = 0;
            do {
                expect(theEvent).instanceOf(GameEvent.ArrowEnteredRoomEvent);
                const arrowEntered = theEvent as GameEvent.ArrowEnteredRoomEvent;

                expect(arrowEntered.getCurrentRoom(), `Expected current room for arrow to be ${currentRoomNum}`)
                    .equals(currentRoomNum);
                
                if(i !== chainRoomNumbers.length) {
                    const nextRoomNum = chainRoomNumbers[i];
                    expect(arrowEntered.getEnteredRoom(), `Expected arrow in ${currentRoomNum} to be shot into ${nextRoomNum}`)
                        .equals(nextRoomNum);
                    currentRoomNum = nextRoomNum;
                }

                theEvent = theEvent.perform(gameState);
                i++;
            } while (i < chainRoomNumbers.length);
        }

        it("returns a player idle event when it enters the final room in the chain", () => {
            const shootRoomNum = 1;
            const nextRooms = [];
            caveStubber.setUpRoomChain(shootRoomNum, nextRooms);

            const arrowEnteredRoom = new GameEvent.ArrowEnteredRoomEvent(shootRoomNum, nextRooms);
            const nextEvent = arrowEnteredRoom.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.PlayerIdleEvent);
        });

        it("sets up the correct chain for a one chain shot", () => {
            const shootRoomNum = 1;
            const nextRooms = [];
            caveStubber.setUpRoomChain(shootRoomNum, nextRooms);

            testShootChain(shootRoomNum, nextRooms);
        });

        it("passes through a chain of two rooms when there is a path between them", () => {
            const shootRoomNum = 1;
            const nextRooms = [2];
            caveStubber.setUpRoomChain(shootRoomNum, nextRooms);

            const arrowEnteredRoom = new GameEvent.ArrowEnteredRoomEvent(shootRoomNum, nextRooms);
            const nextEvent = arrowEnteredRoom.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.ArrowEnteredRoomEvent);
        });

        it("sets up the correct chain for a two chain shot", () => {
            const shootRoomNum = 1;
            const nextRooms = [2];
            caveStubber.setUpRoomChain(shootRoomNum, nextRooms);

            testShootChain(shootRoomNum, nextRooms);
        });

        it("enters a random room when there is not a path between two rooms", () => {
            const shootRoomNum = 1;
            const nextRooms = [2];

            const lastRoom = caveStubber.setUpBrokenRoomChain(shootRoomNum, nextRooms);

            // Create neighbors in the last room and randomly select one for the arrow to travel to.
            const neighborRoomNums = [100, 200, 300];
            caveStubber.addNeighbors(lastRoom, neighborRoomNums);
            const neighborIdx = 1;
            randInt.returns(neighborIdx);

            const arrowEnteredRoom = new GameEvent.ArrowEnteredRoomEvent(shootRoomNum, nextRooms);
            const nextEvent = arrowEnteredRoom.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.ArrowEnteredRandomRoomEvent);

            const arrowEnteredRandRoom = nextEvent as GameEvent.ArrowEnteredRandomRoomEvent;
            expect(arrowEnteredRandRoom.getFromRoom(), "Incorrect from room").equals(shootRoomNum);
            expect(arrowEnteredRandRoom.getToRoom(), "Incorrect to room").equals(nextRooms[0]);
            expect(arrowEnteredRandRoom.getEnteredRoom(), "Incorrect next room").equals(neighborRoomNums[neighborIdx]);
        });

        it("returns a player shot wumpus event when the arrow enters the wumpus room", () => {
            const shootRoomNum = 1;

            const wumpusRoom = tsSinon.stubInterface<WumpusRoom>();
            wumpusRoom.hasWumpus.returns(true);
            cave.getRoom.withArgs(shootRoomNum).returns(wumpusRoom);

            const arrowEnteredRoom = new GameEvent.ArrowEnteredRoomEvent(shootRoomNum, []);
            const nextEvent = arrowEnteredRoom.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.PlayerShotWumpusEvent);
        });

        it("returns a player shot self event when the arrow enters the player's room", () => {
            const shootRoomNum = 1;

            const playersRoom = tsSinon.stubInterface<WumpusRoom>();
            cave.getCurrentRoom.returns(playersRoom);
            cave.getRoom.withArgs(shootRoomNum).returns(playersRoom);

            const arrowEnteredRoom = new GameEvent.ArrowEnteredRoomEvent(shootRoomNum, []);
            const nextEvent = arrowEnteredRoom.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.PlayerShotSelfEvent);
        });
    });

    describe("ArrowEnteredRandomRoomEvent", () => {
        it("returns a arrow entered room event", () => {
            const fromRoomNum = 1;
            const toRoomNum = 2;
            const enterRoomNum = 3;
            
            const arrowEnteredRandRoom = new GameEvent.ArrowEnteredRandomRoomEvent(fromRoomNum, toRoomNum, enterRoomNum);
            const nextEvent = arrowEnteredRandRoom.perform(gameState);

            expect(nextEvent).instanceOf(GameEvent.ArrowEnteredRoomEvent);

            const arrowEnteredRoom = nextEvent as GameEvent.ArrowEnteredRoomEvent;
            expect(arrowEnteredRoom.getCurrentRoom(), "Incorrect current room").equals(enterRoomNum);
            expect(arrowEnteredRoom.getEnteredRoom(), "Incorrect next room").equals(undefined);
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

