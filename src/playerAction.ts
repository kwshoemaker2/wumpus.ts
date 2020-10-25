import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';

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
     * Create the player action from the player command.
     * @param command 
     */
    createPlayerAction(action: WumpusCommand): PlayerAction;
}

export class PlayerActionFactoryImpl implements PlayerActionFactory {

    createPlayerAction(command: WumpusCommand): PlayerAction {
        if(command.type === WumpusCommandType.Move) {
            const roomNumber = command.args[0];
            return new MovePlayer(roomNumber);
        }
        else if(command.type === WumpusCommandType.Quit) {
            return new QuitGame();
        }
        else
        {
            return undefined;
        }
    }
}

