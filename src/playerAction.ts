import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand'
import { GameEvent,
         PlayerMovedToRoomEvent,
         PlayerHitWallEvent,
         PlayerIdleEvent,
         MovedByBatsEvent,
         PlayerFellInPitEvent,
         GameOverEvent,
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
 * Provides a display for each game event.
 */
export class GameEventDisplay {
    // TODO make display a constructor param (or replace it with this class).
    public displayGameEvent(gameEvent: GameEvent, display: WumpusDisplay): void {
        if(gameEvent instanceof PlayerHitWallEvent) {
            display.showPlayerHitWall();
        } else if(gameEvent instanceof PlayerFellInPitEvent) {
            display.showPlayerFellInPit();
        } else if(gameEvent instanceof MovedByBatsEvent) {
            display.showPlayerMovedByBats();
        }
    }
}

/**
 * Handles moving the player.
 */
export class MovePlayer implements PlayerAction {

    private playerMovedToRoomEvent: GameEvent;
    private gameEventDisplay: GameEventDisplay;

    constructor(playerMovedToRoomEvent: GameEvent) {
        this.playerMovedToRoomEvent = playerMovedToRoomEvent;
        this.gameEventDisplay = new GameEventDisplay();
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        let playerIdle: boolean = false;
        let gameRunning: boolean = false;
        let gameEvent: GameEvent = this.playerMovedToRoomEvent.perform(cave);
        do {
            this.gameEventDisplay.displayGameEvent(gameEvent, display);
            gameRunning = this.isGameRunning(gameEvent);
            playerIdle = this.isPlayerIdle(gameEvent);
            gameEvent = gameEvent.perform(cave);
        } while(!playerIdle && gameRunning);

        return gameRunning;
    }

    isGameRunning(gameEvent: GameEvent): boolean {
        return !(gameEvent instanceof GameOverEvent);
    }

    isPlayerIdle(gameEvent: GameEvent) {
        return (gameEvent instanceof PlayerIdleEvent);
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
            return new MovePlayer(new PlayerMovedToRoomEvent(roomNumber));
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

/**
 * Factory class that makes GameEvent objects.
 */
export interface GameEventFactory {
    /**
     * Create the game event from the player command.
     * @param command 
     */
    createPlayerAction(action: WumpusCommand): GameEvent;
}

/**
 * Implements GameEventFactory
 */
export class GameEventFactoryImpl implements GameEventFactory {

    createPlayerAction(command: WumpusCommand): GameEvent {
        if(command.type === WumpusCommandType.Move) {
            const roomNumber = command.args[0];
            return new PlayerMovedToRoomEvent(roomNumber);
        }
        else if(command.type === WumpusCommandType.Quit) {
            return new GameOverEvent();
        }
        else
        {
            return undefined;
        }
    }
}
