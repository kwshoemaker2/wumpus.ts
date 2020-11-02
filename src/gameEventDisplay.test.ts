import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import { WumpusDisplay } from './wumpusDisplay'
import {
    PlayerHitWallEvent,
    MovedByBatsEvent,
    PlayerFellInPitEvent
} from './gameEvent';
import {GameEventDisplay } from './gameEventDisplay'

describe("GameEventDisplay", () => {
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let gameEventDisplay: GameEventDisplay = null;

    beforeEach(() => {
        display = tsSinon.stubInterface<WumpusDisplay>();
        gameEventDisplay = new GameEventDisplay();
    });

    it("tells player they fell in a pit when they enter a room with a pit", () => {
        gameEventDisplay.displayGameEvent(new PlayerFellInPitEvent(), display);

        expect(display.showPlayerFellInPit.calledOnce).equals(true);
    });

    it("tells player they hit a wall when moving to a non-adjacent room", () => {
        gameEventDisplay.displayGameEvent(new PlayerHitWallEvent(), display);

        expect(display.showPlayerHitWall.calledOnce).equals(true);
    });

    it("tells player they were moved by bats when they enter a room with bats", () => {
        gameEventDisplay.displayGameEvent(new MovedByBatsEvent(), display);

        expect(display.showPlayerMovedByBats.calledOnce).equals(true);
    });
});
