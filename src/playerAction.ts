import { WumpusCave } from './wumpusCave'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand'
import { GameEvent,
         PlayerMovedToRoomEvent,
         PlayerIdleEvent,
         GameOverEvent,
        } from './gameEvent'
import { GameEventDisplayImpl } from './gameEventDisplay';

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

export interface GameEventIterator extends Iterator<GameEvent> {
}

export class GameEventIteratorImpl implements GameEventIterator {

    private currentEvent: GameEvent;
    // TODO figure out how (if possible) to add as a param to next
    private cave: WumpusCave;

    public constructor(initialEvent: GameEvent, cave: WumpusCave) {
        this.currentEvent = initialEvent;
    }

    public next(): IteratorResult<GameEvent> {
        const resultEvent = this.currentEvent;
        let playerIdle: boolean = false;
        let gameRunning: boolean = false;
        gameRunning = this.isGameRunning(resultEvent);
        playerIdle = this.isPlayerIdle(resultEvent);
        this.currentEvent = resultEvent.perform(this.cave);


        return {
            done: (playerIdle || !gameRunning),
            value: resultEvent
        }
    }

    
    private isGameRunning(gameEvent: GameEvent): boolean {
        return !(gameEvent instanceof GameOverEvent);
    }

    private isPlayerIdle(gameEvent: GameEvent) {
        return (gameEvent instanceof PlayerIdleEvent);
    }
}

/**
 * Handles moving the player.
 */
export class MovePlayer implements PlayerAction {

    private playerMovedToRoomEvent: GameEvent;

    constructor(playerMovedToRoomEvent: GameEvent) {
        this.playerMovedToRoomEvent = playerMovedToRoomEvent;
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        const gameEventIterator = new GameEventIteratorImpl(this.playerMovedToRoomEvent, cave)
        const gameEventDisplay = new GameEventDisplayImpl(display);

        let done: boolean = false;
        let gameEvent: GameEvent;
        do {
            const gameEventIteratorResult = gameEventIterator.next();
            gameEvent = gameEventIteratorResult.value;
            done = gameEventIteratorResult.done;
            gameEventDisplay.displayGameEvent(gameEvent);
        } while(!done);

        return !(gameEvent instanceof GameOverEvent);
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

/**
 * Implements PlayerActionFactory.
 */
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
    createGameEventFromCommand(action: WumpusCommand): GameEvent;
}

/**
 * Implements GameEventFactory
 */
export class GameEventFactoryImpl implements GameEventFactory {

    createGameEventFromCommand(command: WumpusCommand): GameEvent {
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
