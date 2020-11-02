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

export class GameEventDisplay {
    // TODO make display a constructor param (or replace it with this class).
    public displayGameEvent(gameEvent: GameEvent, display: WumpusDisplay): void {
        if (gameEvent instanceof PlayerHitWallEvent) {
            display.showPlayerHitWall();
        } else if (gameEvent instanceof PlayerFellInPitEvent) {
            display.showPlayerFellInPit();
        } else if (gameEvent instanceof MovedByBatsEvent) {
            display.showPlayerMovedByBats();
        }
    }
}
