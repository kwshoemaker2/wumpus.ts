import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import { WumpusCave } from './wumpusCave'
import { PlayerActionImpl } from './playerAction';
import { GameEvent, GameOverEvent, PlayerIdleEvent } from './gameEvent'
import { GameEventDisplay } from './GameEventDisplay';

describe("PlayerActionImpl", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let gameEventDisplay: tsSinon.StubbedInstance<GameEventDisplay> = null;
    let initialEvent: tsSinon.StubbedInstance<GameEvent> = null;
    let gameEventProcessor: PlayerActionImpl = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        gameEventDisplay = tsSinon.stubInterface<GameEventDisplay>();
        initialEvent = getGameEventStub();
        gameEventProcessor = new PlayerActionImpl(initialEvent);
    });

    function getGameEventStub(): tsSinon.StubbedInstance<GameEvent> {
        return tsSinon.stubInterface<GameEvent>();
    }

    it("indicates game is running when the next event is that the player is idle", () => {
        initialEvent.perform.returns(new PlayerIdleEvent());

        const gameRunning = gameEventProcessor.perform(cave, gameEventDisplay);

        expect(gameRunning).equals(true);
    });

    it("indicates game is not running when the next event is that the game is over", () => {
        initialEvent.perform.returns(new GameOverEvent());

        const gameRunning = gameEventProcessor.perform(cave, gameEventDisplay);

        expect(gameRunning).equals(false);
    });

    it("keeps performing events that it receives until it's done", () => {
        const gameEvent1 = getGameEventStub();
        const gameEvent2 = getGameEventStub();
        const gameEvent3 = new PlayerIdleEvent();

        initialEvent.perform.returns(gameEvent1);
        gameEvent1.perform.returns(gameEvent2);
        gameEvent2.perform.returns(gameEvent3);

        gameEventProcessor.perform(cave, gameEventDisplay);

        expect(initialEvent.perform.calledOnce).equals(true);
        expect(gameEvent1.perform.calledOnce).equals(true);
        expect(gameEvent2.perform.calledOnce).equals(true);
    });
});
