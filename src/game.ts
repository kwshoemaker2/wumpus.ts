
import { WumpusOptions } from './wumpusOptions'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusAction } from './wumpusAction';

/**
 * Hunt the Wumpus game.
 */
export class Game {
    private options: WumpusOptions;
    private cave: WumpusCave;
    private display: WumpusDisplay;

    public constructor(options: WumpusOptions,
                       cave: WumpusCave,
                       display: WumpusDisplay) {
        this.options = options;
        this.cave = cave;
        this.display = display;
    }

    public async run(): Promise<void> {
        this.display.showIntroduction(this.options);

        this.gameLoop();
    }

    private async gameLoop(): Promise<void> {
        let running: boolean = true;
        while(running) {
            let currentRoom: WumpusRoom = this.cave.getCurrentRoom();
            this.display.showRoomEntry(currentRoom);

            const nextAction = await this.display.getUserAction();
            if(nextAction === WumpusAction.Quit) {
                running = false;
            }
        }
        
    }
}
