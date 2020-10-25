import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand, WumpusAction } from './wumpusAction';
import { PlayerAction, PlayerActionFactory } from './playerAction';

/**
 * Hunt the Wumpus game.
 */
export class Game {
    private cave: WumpusCave;
    private display: WumpusDisplay;
    private playerActionFactory: PlayerActionFactory;

    public constructor(cave: WumpusCave,
                       display: WumpusDisplay,
                       playerActionFactory: PlayerActionFactory) {
        this.cave = cave;
        this.display = display;
        this.playerActionFactory = playerActionFactory;
    }

    /**
     * Run the game.
     */
    public async run(): Promise<void> {
        await this.gameLoop();
    }

    /**
     * Run until the game finishes.
     */
    private async gameLoop(): Promise<void> {
        let running: boolean = true;
        while(running) {
            this.displayCurrentRoom();
            const nextAction = await this.getNextAction();
            running = this.doAction(nextAction);
        }
    }

    private displayCurrentRoom(): void {
        let currentRoom: WumpusRoom = this.cave.getCurrentRoom();
        this.display.showRoomEntry(currentRoom);
    }

    private async getNextAction(): Promise<WumpusAction> {
        return await this.display.getUserAction();
    }

    private doAction(action: WumpusAction): boolean {
        const userAction = this.playerActionFactory.createPlayerAction(action);
        return userAction.perform(this.cave, this.display);
    }
}
