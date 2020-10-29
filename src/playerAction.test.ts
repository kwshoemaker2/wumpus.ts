import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import * as sinon from 'sinon'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';
import { MovePlayer, PlayerActionFactoryImpl, QuitGame } from './playerAction';

describe("MovePlayer", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
    });

    function setNextRoom(nextRoom: WumpusRoom, roomNumber: number, callNum: number = 0): void {
        cave.adjacentRoom.withArgs(roomNumber).returns(true);
        cave.getCurrentRoom.onCall(callNum).returns(nextRoom);    
    }

    function setCurrentRoom(currentRoom: WumpusRoom, callNum: number = 0): void {
        cave.getCurrentRoom.onCall(callNum).returns(currentRoom);
    }

    it("moves the player to the room when it's adjacent", () => {
        const roomNumber = 10;

        const nextRoom = tsSinon.stubInterface<WumpusRoom>();
        nextRoom.hasPit.returns(false);

        setNextRoom(nextRoom, roomNumber);    

        const movePlayer = new MovePlayer(roomNumber);
        const gameRunning = movePlayer.perform(cave, display);

        expect(gameRunning).equals(true);
        expect(cave.move.calledOnceWith(roomNumber)).equals(true);
    });

    it("tells player they fell in a pit when they enter a room with a pit", () => {
        const roomNumber = 10;

        const nextRoom = tsSinon.stubInterface<WumpusRoom>();
        nextRoom.hasPit.returns(true);

        setNextRoom(nextRoom, roomNumber);  

        const movePlayer = new MovePlayer(roomNumber);
        const gameRunning = movePlayer.perform(cave, display);

        expect(gameRunning).equals(false);
        expect(display.showPlayerFellInPit.calledOnce).equals(true);
    });

    it("tells player they hit a wall when moving to a non-adjacent room", () => {
        const roomNumber = 10;
        const movePlayer = new MovePlayer(roomNumber);

        cave.adjacentRoom.withArgs(roomNumber).returns(false);     

        const gameRunning = movePlayer.perform(cave, display);

        expect(gameRunning).equals(true);
        expect(display.showPlayerHitWall.calledOnce).equals(true);
    });

    it("tells player they were moved by bats when they enter a room with bats", () => {
        const roomNumber = 10;

        const nextRoom = tsSinon.stubInterface<WumpusRoom>();
        nextRoom.hasBats.returns(true);

        setNextRoom(nextRoom, roomNumber);  

        const movePlayer = new MovePlayer(roomNumber);
        const gameRunning = movePlayer.perform(cave, display);

        expect(gameRunning).equals(true);
        expect(display.showPlayerMovedByBats.calledOnce).equals(true);
    });

    it("moves player to a random room when they enter a room with bats", () => {
        const roomNumber = 10;
        const movePlayer = new MovePlayer(roomNumber);

        const nextRoom = tsSinon.stubInterface<WumpusRoom>();
        nextRoom.hasBats.returns(true);
        setNextRoom(nextRoom, roomNumber);

        movePlayer.perform(cave, display);

        expect(cave.movePlayerToRandomRoom.calledOnce).equals(true);
    });
});

describe("PlayerActionFactoryImp", () => {
    let factory: PlayerActionFactoryImpl = new PlayerActionFactoryImpl();

    it("returns a move player action when given a move command and room number", () => {
        const command = new WumpusCommand(WumpusCommandType.Move, [ 1 ]);
        const action = factory.createPlayerAction(command);
        expect(action.constructor.name).equals(MovePlayer.name);
    });

    it("returns a quit game action when given a quit command", () => {
        const command = new WumpusCommand(WumpusCommandType.Quit, []);
        const action = factory.createPlayerAction(command);
        expect(action.constructor.name).equals(QuitGame.name);
    });
});
