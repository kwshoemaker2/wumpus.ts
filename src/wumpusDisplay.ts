
import { WumpusRoom } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'

export interface WumpusDisplay {
    showIntroduction(options: WumpusOptions): void;

    showRoomEntry(room: WumpusRoom): void;

    showPlayerHitWall(): void;

    showPlayerFellInPit(): void;

    showPlayerMovedByBats(): void;
}
