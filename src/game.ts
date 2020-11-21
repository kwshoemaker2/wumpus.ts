import { GameEventDisplay } from './GameEventDisplay'
import { PlayerActionTranslator } from './playerActionTranslator'
import { GameState } from './gameState'

/**
 * Hunt the Wumpus game.
 */
export class Game {
    private gameState: GameState;
    private playerActionTranslator: PlayerActionTranslator;
    private gameEventDisplay: GameEventDisplay;

    public constructor(gameState: GameState,
                       playerActionTranslator: PlayerActionTranslator,
                       gameEventDisplay: GameEventDisplay) {
        this.gameState = gameState;
        this.playerActionTranslator = playerActionTranslator;
        this.gameEventDisplay = gameEventDisplay;
    }

    /**
     * Run the game.
     */
    public async run(): Promise<void> {
        let running: boolean = true;
        while(running) {
            this.gameEventDisplay.displayCurrentRoom(this.gameState.cave);
            const playerAction = await this.playerActionTranslator.getPlayerAction();
            running = playerAction.perform(this.gameState, this.gameEventDisplay);
        }
    }
}
