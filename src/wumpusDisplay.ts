
import { WumpusRoom } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'
import { WumpusAction } from './wumpusAction'

export interface WumpusDisplay {
    showIntroduction(options: WumpusOptions): void;

    showRoomEntry(room: WumpusRoom): void;

    showPlayerHitWall(): void;

    showPlayerFellInPit(): void;

    getUserAction(): Promise<WumpusAction>;
}
