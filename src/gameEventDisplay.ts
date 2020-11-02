import { WumpusDisplay } from './wumpusDisplay';
import {
    GameEvent,
    PlayerHitWallEvent,
    MovedByBatsEvent,
    PlayerFellInPitEvent
} from './gameEvent';
import { WumpusCave } from './wumpusCave';

/**
 * Provides a display for each game event.
 */
export interface GameEventDisplay {

    /**
     * Display details about the current room the user is in.
     * @param cave 
     */
    displayCurrentRoom(cave: WumpusCave): void;

    /**
     * Display the game event to the user.
     * @param gameEvent 
     */
    displayGameEvent(gameEvent: GameEvent): void;
}

/**
 * Implementation of GameEventDisplay.
 */
export class GameEventDisplayImpl implements GameEventDisplay {
    private display: WumpusDisplay;

    constructor(display: WumpusDisplay) {
        this.display = display;
    }

    public displayCurrentRoom(cave: WumpusCave): void {
        this.display.showRoomEntry(cave.getCurrentRoom());
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
