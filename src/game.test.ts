import { expect } from 'chai';
import { WumpusOptions } from './wumpusOptions'
import { WumpusCave, WumpusCaveImpl } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
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
        game = new Game(options, cave, display);
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

        expect(display.getUserAction.calledOnce);
    });

    it("displays the introduction using the options", async () => {
        makeQuit();

        await game.run();

        expect(display.showIntroduction.calledOnce);

        const showedOptions = display.showIntroduction.firstCall.lastArg
        expect(showedOptions).equals(options);
    });
});
