import { WumpusDisplay } from './wumpusDisplay';
import {
    GameEvent,
    PlayerHitWallEvent,
    MovedByBatsEvent,
    PlayerFellInPitEvent
} from './gameEvent';

/**
 * Provides a display for each game event.
 */
export interface GameEventDisplayImpl {
    displayGameEvent(gameEvent: GameEvent, display: WumpusDisplay): void;
}

/**
 * Implementation of GameEventDisplay.
 */
export class GameEventDisplayImpl {
    private display: WumpusDisplay;

    constructor(display: WumpusDisplay) {
        this.display = display;
    }

    public displayGameEvent(gameEvent: GameEvent): void {
        if (gameEvent instanceof PlayerHitWallEvent) {
            this.display.showPlayerHitWall();
        } else if (gameEvent instanceof PlayerFellInPitEvent) {
            this.display.showPlayerFellInPit();
        } else if (gameEvent instanceof MovedByBatsEvent) {
            this.display.showPlayerMovedByBats();
        }
    }
}
