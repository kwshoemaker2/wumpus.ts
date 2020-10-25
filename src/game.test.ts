import { expect } from 'chai';
import { WumpusOptions } from './wumpusOptions'
import { WumpusCave, WumpusCaveImpl } from './wumpusCave'
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand, WumpusAction } from './wumpusAction';
import { Game } from './game';
import { PlayerAction, PlayerActionFactory } from './playerAction';
import * as tsSinon from "ts-sinon"

describe("Game", () => {
    let options: WumpusOptions = null;
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let playerActionFactory: tsSinon.StubbedInstance<PlayerActionFactory> = null;
    let game: Game = null;

    beforeEach(() => {
        options = new WumpusOptions;
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
        playerActionFactory = tsSinon.stubInterface<PlayerActionFactory>();
        game = new Game(cave, display, playerActionFactory);
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

    function setPlayerAction(playerAction: PlayerAction, callNumber: number = 0): void {
        const promise = new Promise<WumpusAction>(resolve => { 
            resolve(new WumpusAction(WumpusCommand.Quit, []))
        });
        setUserAction(promise, callNumber);

        playerActionFactory.createPlayerAction.onCall(callNumber).returns(playerAction);
    }

    it("stops running after the first action returns false", async () => {
        const playerAction = tsSinon.stubInterface<PlayerAction>();
        playerAction.perform.returns(false);
        setPlayerAction(playerAction);

        await game.run();

        expect(display.getUserAction.calledOnce).equals(true);
        expect(playerActionFactory.createPlayerAction.calledOnce).equals(true);
    });

    it("stops running after the third action returns false", async () => {
        const playerAction = tsSinon.stubInterface<PlayerAction>();
        playerAction.perform.onFirstCall().returns(true);
        setPlayerAction(playerAction, 0);

        playerAction.perform.onSecondCall().returns(true);
        setPlayerAction(playerAction, 1);

        playerAction.perform.onThirdCall().returns(false);
        setPlayerAction(playerAction, 2);

        await game.run();

        expect(display.getUserAction.calledThrice).equals(true);
        expect(playerActionFactory.createPlayerAction.calledThrice).equals(true);
    });

    it("displays the current room", async () => {
        const playerAction = tsSinon.stubInterface<PlayerAction>();
        playerAction.perform.returns(false);
        setPlayerAction(playerAction);

        const currentRoom = new WumpusRoomImpl(1);
        cave.getCurrentRoom.onFirstCall().returns(currentRoom);

        await game.run();

        expect(display.showRoomEntry.calledOnceWith(currentRoom)).equals(true);
    });

    xit("moves the player to the room when it's adjacent", async () => {
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

    xit("tells player they hit a wall when moving to a non-adjacent room", async () => {
        const roomNumber = 10;
        makeMove(roomNumber, 0);
        makeQuit(1);

        cave.adjacentRoom.withArgs(roomNumber).returns(false);

        await game.run();

        expect(display.showPlayerHitWall.calledOnce).equals(true);
    });

    xit("tells player they fell in a pit when they enter a room with a pit", async () => {
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
