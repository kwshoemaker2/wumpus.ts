
import { WumpusOptions } from './wumpusOptions'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'

/**
 * Hunt the Wumpus game.
 */
export class Wumpus {
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

    public run() {
        this.display.showIntroduction(this.options);
        
        let currentRoom: WumpusRoom = this.cave.getCurrentRoom();
        this.display.showRoomEntry(currentRoom);
    }
}