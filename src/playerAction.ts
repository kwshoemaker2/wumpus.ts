import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand'
import { RandomRangeFunction, getRandomIntBetween } from './wumpusUtils'
import { GameEvent,
         PlayerMovedToRoomEvent,
         PlayerHitWallEvent,
         PlayerEnteredRoomEvent,
         MovedByBatsEvent,
         PlayerFellInPitEvent,
        } from './gameEvent'

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

    private playerMovedToRoomEvent: PlayerMovedToRoomEvent;

    constructor(roomNumber: number) {
        this.playerMovedToRoomEvent = new PlayerMovedToRoomEvent(roomNumber);
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        let playerMoved: boolean = false;
        let gameOver: boolean = false;
        let gameEvent: GameEvent = this.playerMovedToRoomEvent.perform(cave);
        do {
            this.displayGameEvent(gameEvent, display);
            gameOver = this.isGameOver(gameEvent);
            playerMoved = this.didPlayerMove(gameEvent);
            gameEvent = gameEvent.perform(cave);
        } while(!playerMoved && !gameOver);

        
        return gameOver;
    }

    displayGameEvent(gameEvent: GameEvent, display: WumpusDisplay): void {
        if(gameEvent instanceof PlayerHitWallEvent) {
            display.showPlayerHitWall();
        } else if(gameEvent instanceof PlayerFellInPitEvent) {
            display.showPlayerFellInPit();
        } else if(gameEvent instanceof MovedByBatsEvent) {
            display.showPlayerMovedByBats();
        }
    }

    isGameOver(gameEvent: GameEvent): boolean {
        if(gameEvent instanceof PlayerFellInPitEvent) {
            return false;
        } else {
            return true;
        }
    }

    didPlayerMove(gameEvent: GameEvent) {
        if(gameEvent instanceof PlayerEnteredRoomEvent) {
            return false;
        } else {
            return true;
        }
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

