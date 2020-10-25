
import { WumpusRoom } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'
import { WumpusCommand } from './wumpusCommand'

export interface WumpusDisplay {
    showIntroduction(options: WumpusOptions): void;

    showRoomEntry(room: WumpusRoom): void;

    showPlayerHitWall(): void;

    showPlayerFellInPit(): void;

    getUserAction(): Promise<WumpusCommand>;
}
