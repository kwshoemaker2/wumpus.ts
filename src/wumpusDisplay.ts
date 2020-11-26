
import { GameState } from './gameState'
import { WumpusOptions } from './wumpusOptions'

export interface WumpusDisplay {
    showIntroduction(options: WumpusOptions): void;

    showGameState(gameState: GameState): void;

    showPlayerHitWall(): void;

    showPlayerSurvivedPit(): void;

    showPlayerFellInPit(): void;

    showPlayerMovedByBats(): void;

    showPlayerMovedByBatsAgain(): void;

    showPlayerEatenByWumpus(): void;

    showArrowWentNowhere(): void;

    showArrowEnteredRandomRoom(fromRoomNum: number,
                               toRoomNum: number,
                               enteredRoomNum: number): void;

    showPlayerOutOfArrows(): void;

    showPlayerShotWumpus(): void;

    showPlayerShotSelf(): void;
}
