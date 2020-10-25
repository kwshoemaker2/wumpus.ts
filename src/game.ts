import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand } from './wumpusCommand';
import { PlayerActionFactory } from './playerAction';

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
            const nextCommand = await this.getNextAction();
            running = this.doAction(nextCommand);
        }
    }

    private displayCurrentRoom(): void {
        let currentRoom: WumpusRoom = this.cave.getCurrentRoom();
        this.display.showRoomEntry(currentRoom);
    }

    private async getNextAction(): Promise<WumpusCommand> {
        return await this.display.getUserAction();
    }

    private doAction(command: WumpusCommand): boolean {
        const userAction = this.playerActionFactory.createPlayerAction(command);
        return userAction.perform(this.cave, this.display);
    }
}
