
import { WumpusRoom } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'

export interface WumpusDisplay {
    showIntroduction(options: WumpusOptions): void;

    showRoomEntry(room: WumpusRoom): void;

    showPlayerHitWall(): void;

    showPlayerSurvivedPit(): void;

    showPlayerFellInPit(): void;

    showPlayerMovedByBats(): void;

    showPlayerMovedByBatsAgain(): void;

    showPlayerEatenByWumpus(): void;
}
