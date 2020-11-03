import { expect } from 'chai'
import * as tsSinon from 'ts-sinon'
import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { UserInteractor } from './userInteractor'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand'
import { Game } from './game'
import { PlayerAction, PlayerActionFactory } from './playerAction'
import { GameEventDisplay } from './GameEventDisplay'


describe("Game", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let userInteractor: tsSinon.StubbedInstance<UserInteractor> = null;
    let playerActionFactory: tsSinon.StubbedInstance<PlayerActionFactory> = null;
    let gameEventDisplay: tsSinon.StubbedInstance<GameEventDisplay> = null;
    let game: Game = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
        userInteractor = tsSinon.stubInterface<UserInteractor>();
        playerActionFactory = tsSinon.stubInterface<PlayerActionFactory>();
        gameEventDisplay = tsSinon.stubInterface<GameEventDisplay>();
        game = new Game(cave, display, userInteractor, playerActionFactory, gameEventDisplay);
    });

    function setUserCommand(promise: Promise<WumpusCommand>, callNumber: number = 0) {
        userInteractor.getUserCommand.onCall(callNumber).returns(promise);
    }

    function setPlayerAction(playerAction: PlayerAction, callNumber: number = 0): void {
        const promise = new Promise<WumpusCommand>(resolve => { 
            resolve(new WumpusCommand(WumpusCommandType.Quit, []))
        });

        setUserCommand(promise, callNumber);
        playerActionFactory.createPlayerAction.onCall(callNumber).returns(playerAction);
    }

    it("displays the current room at the start", async () => {
        const playerAction = tsSinon.stubInterface<PlayerAction>();
        playerAction.perform.returns(false);
        setPlayerAction(playerAction);

        await game.run();

        expect(gameEventDisplay.displayCurrentRoom.calledOnceWith(cave)).equals(true)
    });

    it("stops running after the first action returns false", async () => {
        const playerAction = tsSinon.stubInterface<PlayerAction>();
        playerAction.perform.returns(false);
        setPlayerAction(playerAction);

        await game.run();

        expect(userInteractor.getUserCommand.calledOnce).equals(true);
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

        expect(userInteractor.getUserCommand.calledThrice).equals(true);
        expect(playerActionFactory.createPlayerAction.calledThrice).equals(true);
    });
});
