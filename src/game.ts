
import { WumpusOptions } from './wumpusOptions'
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand } from './wumpusAction';

/**
 * Hunt the Wumpus game.
 */
export class Game {
    private cave: WumpusCave;
    private display: WumpusDisplay;

    public constructor(cave: WumpusCave,
                       display: WumpusDisplay) {
        this.cave = cave;
        this.display = display;
    }

    public async run(): Promise<void> {
        await this.gameLoop();
    }

    private async gameLoop(): Promise<void> {
        let running: boolean = true;
        while(running) {
            let currentRoom: WumpusRoom = this.cave.getCurrentRoom();
            this.display.showRoomEntry(currentRoom);

            const nextAction = await this.display.getUserAction();
            if(nextAction.command === WumpusCommand.Quit) {
                running = false;
            } else if(nextAction.command === WumpusCommand.Move) {
                running = !this.movePlayer(nextAction.args[0]);
            }
        }
    }

    /**
     * Move the player to the specified room.
     * 
     * Returns true if the player died.
     */
    private movePlayer(roomNumber: number): boolean
    {
        let playerDied: boolean = false;

        if(this.cave.adjacentRoom(roomNumber)) {
            this.cave.move(roomNumber);
            const currentRoom = this.cave.getCurrentRoom();
            if(currentRoom.hasPit()) {
                this.display.showPlayerFellInPit();
                playerDied = true;
            }
        } else {
            this.display.showPlayerHitWall();
        }

        return playerDied
    }
}
