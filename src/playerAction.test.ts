import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';
import { GameEventProcessor, GameEventFactoryImpl, QuitGame } from './playerAction';
import { GameEvent, GameOverEvent, PlayerIdleEvent, PlayerMovedToRoomEvent } from './gameEvent'

describe("GameEventProcessor", () => {
    let cave: tsSinon.StubbedInstance<WumpusCave> = null;
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let playerMovedToRoomEvent: tsSinon.StubbedInstance<GameEvent> = null;
    let gameEventProcessor: GameEventProcessor = null;

    beforeEach(() => {
        cave = tsSinon.stubInterface<WumpusCave>();
        display = tsSinon.stubInterface<WumpusDisplay>();
        playerMovedToRoomEvent = getGameEventStub();
        gameEventProcessor = new GameEventProcessor(playerMovedToRoomEvent);
    });

    function getGameEventStub(): tsSinon.StubbedInstance<GameEvent> {
        return tsSinon.stubInterface<GameEvent>();
    }

    it("indicates game is running when the next event is that the player is idle", () => {
        playerMovedToRoomEvent.perform.returns(new PlayerIdleEvent());

        const gameRunning = gameEventProcessor.perform(cave, display);

        expect(gameRunning).equals(true);
    });

    it("indicates game is not running when the next event is that the game is over", () => {
        playerMovedToRoomEvent.perform.returns(new GameOverEvent());

        const gameRunning = gameEventProcessor.perform(cave, display);

        expect(gameRunning).equals(false);
    });

    it("keeps performing events that it receives until it's done", () => {
        const gameEvent1 = getGameEventStub();
        const gameEvent2 = getGameEventStub();
        const gameEvent3 = new PlayerIdleEvent();

        playerMovedToRoomEvent.perform.returns(gameEvent1);
        gameEvent1.perform.returns(gameEvent2);
        gameEvent2.perform.returns(gameEvent3);

        gameEventProcessor.perform(cave, display);

        expect(playerMovedToRoomEvent.perform.calledOnce).equals(true);
        expect(gameEvent1.perform.calledOnce).equals(true);
        expect(gameEvent2.perform.calledOnce).equals(true);
    });
});

describe("GameEventFactoryImpl", () => {
    let factory: GameEventFactoryImpl = new GameEventFactoryImpl();

    it("returns a move player action when given a move command and room number", () => {
        const command = new WumpusCommand(WumpusCommandType.Move, [ 1 ]);
        const gameEvent = factory.createGameEventFromCommand(command);
        expect(gameEvent).instanceOf(PlayerMovedToRoomEvent);
    });

    it("returns a quit game action when given a quit command", () => {
        const command = new WumpusCommand(WumpusCommandType.Quit, []);
        const gameEvent = factory.createGameEventFromCommand(command);
        expect(gameEvent).instanceOf(GameOverEvent);
    });
});
