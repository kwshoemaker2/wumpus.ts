import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';
import { RandomRangeFunction, getRandomIntBetween } from './wumpusUtils'

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
    private randInt: RandomRangeFunction;

    constructor(roomNumber: number) {
        this.roomNumber = roomNumber;
        this.randInt = getRandomIntBetween;
    }

    public setRandIntFunction(randInt: RandomRangeFunction) {
        this.randInt = randInt;
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
                playerSurvived = this.handlePit(display);
            } else if(currentRoom.hasBats()) {
                playerSurvived = this.handleBats(display, cave);
            }
        } else {
            display.showPlayerHitWall();
        }

        return playerSurvived
    }

    private handlePit(display: WumpusDisplay): boolean {
        display.showPlayerFellInPit();
        return false;
    }

    private handleBats(display: WumpusDisplay, cave: WumpusCave): boolean {
        display.showPlayerMovedByBats();
        cave.movePlayerToRandomRoom();
        return true;
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

