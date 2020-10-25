import { expect } from 'chai';
import * as tsSinon from "ts-sinon"
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand, WumpusAction } from './wumpusAction';
import { Game } from './game';
import { PlayerAction, PlayerActionFactory } from './playerAction';


describe("Game", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let playerActionFactory: tsSinon.StubbedInstance<PlayerActionFactory> = null;
    let game: Game = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
        playerActionFactory = tsSinon.stubInterface<PlayerActionFactory>();
        game = new Game(cave, display, playerActionFactory);
    });

    function setUserAction(promise: Promise<WumpusAction>, callNumber: number = 0) {
        display.getUserAction.onCall(callNumber).returns(promise);
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

        const currentRoom = tsSinon.stubInterface<WumpusRoom>();
        cave.getCurrentRoom.onFirstCall().returns(currentRoom);

        await game.run();

        expect(display.showRoomEntry.calledOnceWith(currentRoom)).equals(true);
    });
});
