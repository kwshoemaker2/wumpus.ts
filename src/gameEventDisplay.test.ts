import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import { WumpusDisplay } from './wumpusDisplay'
import * as GameEvent from './gameEvent'
import { WumpusRoom } from './wumpusRoom'
import { WumpusCave } from './wumpusCave'
import {GameEventDisplayImpl } from './gameEventDisplay'

describe("GameEventDisplay", () => {
    let display: tsSinon.StubbedInstance<WumpusDisplay> = null;
    let gameEventDisplay: GameEventDisplayImpl = null;

    beforeEach(() => {
        display = tsSinon.stubInterface<WumpusDisplay>();
        gameEventDisplay = new GameEventDisplayImpl(display);
    });

    it("displays the current room from the WumpusCave object", async () => {
        const cave = tsSinon.stubInterface<WumpusCave>();
        const currentRoom = tsSinon.stubInterface<WumpusRoom>();
        cave.getCurrentRoom.onFirstCall().returns(currentRoom);

        gameEventDisplay.displayCurrentRoom(cave);

        expect(display.showRoomEntry.calledOnceWith(currentRoom)).equals(true);
    });

    it("tells player they survived a pit", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.PlayerSurvivedPitEvent());

        expect(display.showPlayerSurvivedPit.calledOnce).equals(true);
    });

    it("tells player they fell in a pit", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.PlayerFellInPitEvent());

        expect(display.showPlayerFellInPit.calledOnce).equals(true);
    });

    it("tells player they hit a wall when moving to a non-adjacent room", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.PlayerHitWallEvent());

        expect(display.showPlayerHitWall.calledOnce).equals(true);
    });

    it("tells player they were moved by bats when they enter a room with bats", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.MovedByBatsEvent());

        expect(display.showPlayerMovedByBats.calledOnce).equals(true);
    });
});
