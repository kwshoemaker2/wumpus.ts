
import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand, WumpusAction } from './wumpusAction';

/**
 * Abstraction for an action a player can perform.
 */
interface PlayerAction {

    /**
     * Perform the action.
     * 
     * Returns true if the game is still running.
     */
    perform(cave: WumpusCave, display: WumpusDisplay): boolean;
}

/**
 * Handles quitting the game.
 */
class QuitGame implements PlayerAction {
    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        // FUTURE Prompt the user if they want to quit.
        cave;
        display;
        return false;
    }
}

/**
 * Handles moving the player.
 */
class MovePlayer implements PlayerAction {

    private roomNumber: number;

    constructor(roomNumber: number) {
        this.roomNumber = roomNumber;
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        return this.movePlayer(cave, display);
    }

    private movePlayer(cave: WumpusCave,
                       display: WumpusDisplay): boolean
    {
        let playerSurvived: boolean = true;

        if(cave.adjacentRoom(this.roomNumber)) {
            cave.move(this.roomNumber);
            const currentRoom = cave.getCurrentRoom();
            if(currentRoom.hasPit()) {
                display.showPlayerFellInPit();
                playerSurvived = false;
            }
        } else {
            display.showPlayerHitWall();
        }

        return playerSurvived
    }
}

function createAction(action: WumpusAction): PlayerAction {
    if(action.command === WumpusCommand.Move) {
        const roomNumber = action.args[0];
        return new MovePlayer(roomNumber);
    }
    else if(action.command === WumpusCommand.Quit) {
        return new QuitGame();
    }
    else
    {
        return undefined;
    }
}

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
            let currentRoom: WumpusRoom = this.cave.getCurrentRoom();
            this.display.showRoomEntry(currentRoom);

            const nextAction = await this.display.getUserAction();
            const userAction = createAction(nextAction);
            running = userAction.perform(this.cave, this.display);
        }
    }
}
