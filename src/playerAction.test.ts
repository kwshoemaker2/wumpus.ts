import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { PlayerActionImpl } from './playerAction';
import { GameEvent, GameOverEvent, PlayerIdleEvent } from './gameEvent'

describe("PlayerActionImpl", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let initialEvent: tsSinon.StubbedInstance<GameEvent> = null;
    let gameEventProcessor: PlayerActionImpl = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
        initialEvent = getGameEventStub();
        gameEventProcessor = new PlayerActionImpl(initialEvent);
    });

    function getGameEventStub(): tsSinon.StubbedInstance<GameEvent> {
        return tsSinon.stubInterface<GameEvent>();
    }

    it("indicates game is running when the next event is that the player is idle", () => {
        initialEvent.perform.returns(new PlayerIdleEvent());

        const gameRunning = gameEventProcessor.perform(cave, display);

        expect(gameRunning).equals(true);
    });

    it("indicates game is not running when the next event is that the game is over", () => {
        initialEvent.perform.returns(new GameOverEvent());

        const gameRunning = gameEventProcessor.perform(cave, display);

        expect(gameRunning).equals(false);
    });

    it("keeps performing events that it receives until it's done", () => {
        const gameEvent1 = getGameEventStub();
        const gameEvent2 = getGameEventStub();
        const gameEvent3 = new PlayerIdleEvent();

        initialEvent.perform.returns(gameEvent1);
        gameEvent1.perform.returns(gameEvent2);
        gameEvent2.perform.returns(gameEvent3);

        gameEventProcessor.perform(cave, display);

        expect(initialEvent.perform.calledOnce).equals(true);
        expect(gameEvent1.perform.calledOnce).equals(true);
        expect(gameEvent2.perform.calledOnce).equals(true);
    });
});
