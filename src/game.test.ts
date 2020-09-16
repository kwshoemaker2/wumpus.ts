import { expect } from 'chai';
import { WumpusOptions } from './wumpusOptions'
import { WumpusCave, WumpusCaveImpl } from './wumpusCave'
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand, WumpusAction } from './wumpusAction';
import { Game } from './game';
import * as tsSinon from "ts-sinon"

describe("Game", () => {
    let options: WumpusOptions = null;
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let game: Game = null;

    beforeEach(() => {
        options = new WumpusOptions;
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
        game = new Game(cave, display);
    });

    function setUserAction(promise: Promise<WumpusAction>, callNumber?: number) {
        if(callNumber) {
            display.getUserAction.onCall(callNumber).returns(promise);
        } else {
            display.getUserAction.returns(promise);
        }
    }

    function makeQuit(callNumber?: number): void {
        const promise = new Promise<WumpusAction>(resolve => { 
            resolve(new WumpusAction(WumpusCommand.Quit, []))
        });

        setUserAction(promise, callNumber);
    }

    function makeMove(roomNumber: number, callNumber?: number): void {
        const promise = new Promise<WumpusAction>(resolve => { 
            resolve(new WumpusAction(WumpusCommand.Move, [roomNumber]))
        });

        setUserAction(promise, callNumber);
    }

    it("runs until it receives a Quit command", async () => {
        makeQuit();

        await game.run();

        expect(display.getUserAction.calledOnce).equals(true);
    });

    it("moves the player to the room when it's adjacent", async () => {
        const roomNumber = 10;
        makeMove(roomNumber, 0);
        makeQuit(1);

        const nextRoom = new WumpusRoomImpl(roomNumber);
        nextRoom.setPit(false);
        cave.getCurrentRoom.onSecondCall().returns(nextRoom);

        cave.adjacentRoom.withArgs(roomNumber).returns(true);

        await game.run();

        expect(cave.move.firstCall.calledWith(roomNumber)).equals(true);
    });

    it("tells player they hit a wall when moving to a non-adjacent room", async () => {
        const roomNumber = 10;
        makeMove(roomNumber, 0);
        makeQuit(1);

        cave.adjacentRoom.withArgs(roomNumber).returns(false);

        await game.run();

        expect(display.showPlayerHitWall.calledOnce).equals(true);
    });

    it("tells player they fell in a pit when they enter a room with a pit", async () => {
        const roomNumber = 10;
        const pitRoom = new WumpusRoomImpl(roomNumber);
        pitRoom.setPit(true);

        cave.getCurrentRoom.onSecondCall().returns(pitRoom);
        cave.adjacentRoom.onFirstCall().returns(true);

        makeMove(roomNumber, 0);
        makeQuit(1);

        await game.run();

        expect(display.showPlayerFellInPit.calledOnce).equals(true);
    });
});
