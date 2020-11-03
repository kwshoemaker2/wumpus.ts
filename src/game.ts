import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { UserInteractor } from './userInteractor'
import { WumpusCommand } from './wumpusCommand';
import { PlayerActionFactory } from './playerAction';
import { GameEventDisplay } from './GameEventDisplay'

/**
 * Hunt the Wumpus game.
 */
export class Game {
    private cave: WumpusCave;
    private display: WumpusDisplay;
    private userInteractor: UserInteractor;
    private playerActionFactory: PlayerActionFactory;
    private gameEventDisplay: GameEventDisplay;

    public constructor(cave: WumpusCave,
                       display: WumpusDisplay,
                       userInteractor: UserInteractor,
                       playerActionFactory: PlayerActionFactory,
                       gameEventDisplay: GameEventDisplay) {
        this.cave = cave;
        this.display = display;
        this.userInteractor = userInteractor;
        this.playerActionFactory = playerActionFactory;
        this.gameEventDisplay = gameEventDisplay;
    }

    /**
     * Run the game.
     */
    public async run(): Promise<void> {
        let running: boolean = true;
        while(running) {
            this.displayCurrentRoom();
            const nextCommand = await this.getNextCommand();
            running = this.doAction(nextCommand);
        }
    }

    private displayCurrentRoom(): void {
        this.gameEventDisplay.displayCurrentRoom(this.cave);
    }

    private async getNextCommand(): Promise<WumpusCommand> {
        return this.userInteractor.getUserCommand();
    }

    private doAction(command: WumpusCommand): boolean {
        const userAction = this.playerActionFactory.createPlayerAction(command);
        return userAction.perform(this.cave, this.display);
    }
}
