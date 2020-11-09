import { WumpusDisplay } from './wumpusDisplay';
import {
    GameEvent,
    PlayerHitWallEvent,
    MovedByBatsEvent,
    PlayerFellInPitEvent,
    PlayerSurvivedPitEvent,
    PlayerIdleEvent
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
    private movedByBats: boolean;

    constructor(display: WumpusDisplay) {
        this.display = display;
        this.movedByBats = false;
    }

    public displayCurrentRoom(cave: WumpusCave): void {
        this.display.showRoomEntry(cave.getCurrentRoom());
    }

    public displayGameEvent(gameEvent: GameEvent): void {
        if (gameEvent instanceof PlayerHitWallEvent) {
            this.display.showPlayerHitWall();
        } else if(gameEvent instanceof PlayerSurvivedPitEvent) {
            this.display.showPlayerSurvivedPit();
        } else if (gameEvent instanceof PlayerFellInPitEvent) {
            this.display.showPlayerFellInPit();
        } else if (gameEvent instanceof MovedByBatsEvent) {
            if(this.movedByBats) {
                this.display.showPlayerMovedByBatsAgain();
            } else {
                this.movedByBats = true;
                this.display.showPlayerMovedByBats();
            }
        } else if (gameEvent instanceof PlayerIdleEvent) {
            this.movedByBats = false;
        }
    }
}
