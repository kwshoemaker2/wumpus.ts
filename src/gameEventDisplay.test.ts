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
        expect(display.showPlayerMovedByBatsAgain.notCalled).equals(true);
    });

    it("tells player they were moved by bats again when bats move them to a room with bats", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.MovedByBatsEvent());
        gameEventDisplay.displayGameEvent(new GameEvent.MovedByBatsEvent());

        expect(display.showPlayerMovedByBats.calledOnce).equals(true);
        expect(display.showPlayerMovedByBatsAgain.calledOnce).equals(true);
    });

    it("does not tell a player they were moved by bats if the player is idle between moves", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.MovedByBatsEvent());
        gameEventDisplay.displayGameEvent(new GameEvent.PlayerIdleEvent());
        gameEventDisplay.displayGameEvent(new GameEvent.MovedByBatsEvent());

        expect(display.showPlayerMovedByBats.calledTwice).equals(true);
        expect(display.showPlayerMovedByBatsAgain.notCalled).equals(true);
    });

    it("tells player they were eaten by a wumpus", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.PlayerEatenByWumpus());

        expect(display.showPlayerEatenByWumpus.calledOnce).equals(true);
    });

    it("tells player they shot a wumpus", () => {
        gameEventDisplay.displayGameEvent(new GameEvent.PlayerShotWumpusEvent());

        expect(display.showPlayerShotWumpus.calledOnce).equals(true);
    });
});
