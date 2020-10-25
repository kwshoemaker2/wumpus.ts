import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommand, WumpusAction } from './wumpusAction';

/**
 * Abstraction for an action a player can perform.
 */
export interface PlayerAction {

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
export class QuitGame implements PlayerAction {
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
export class MovePlayer implements PlayerAction {

    private roomNumber: number;

    constructor(roomNumber: number) {
        this.roomNumber = roomNumber;
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        return this.movePlayer(cave, display);
    }

    private movePlayer(cave: WumpusCave, display: WumpusDisplay): boolean {
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

/**
 * Factory class that makes PlayerAction objects.
 */
export interface PlayerActionFactory {
    /**
     * Create the PlayerAction from the WumpusAction.
     * @param action 
     */
    createPlayerAction(action: WumpusAction): PlayerAction;
}

export class PlayerActionFactoryImpl implements PlayerActionFactory {

    createPlayerAction(action: WumpusAction): PlayerAction {
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
}

