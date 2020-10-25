import { expect } from 'chai';
import * as tsSinon from "ts-sinon"
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand, WumpusAction } from './wumpusAction';
import { MovePlayer } from './playerAction';

describe("MovePlayer", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
    });

    function setNextRoom(nextRoom: WumpusRoom, roomNumber: number): void {
        cave.adjacentRoom.withArgs(roomNumber).returns(true);
        cave.getCurrentRoom.onFirstCall().returns(nextRoom);    
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
});
