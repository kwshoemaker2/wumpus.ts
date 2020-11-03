import { WumpusCave } from './wumpusCave'
import { GameEventDisplay } from './GameEventDisplay'
import { PlayerActionTranslator } from './playerActionTranslator'

/**
 * Hunt the Wumpus game.
 */
export class Game {
    private cave: WumpusCave;
    private playerActionTranslator: PlayerActionTranslator;
    private gameEventDisplay: GameEventDisplay;

    public constructor(cave: WumpusCave,
                       playerActionTranslator: PlayerActionTranslator,
                       gameEventDisplay: GameEventDisplay) {
        this.cave = cave;
        this.playerActionTranslator = playerActionTranslator;
        this.gameEventDisplay = gameEventDisplay;
    }

    /**
     * Run the game.
     */
    public async run(): Promise<void> {
        let running: boolean = true;
        while(running) {
            this.gameEventDisplay.displayCurrentRoom(this.cave);
            const playerAction = await this.playerActionTranslator.getPlayerAction();
            running = playerAction.perform(this.cave, this.gameEventDisplay);
        }
    }
}
