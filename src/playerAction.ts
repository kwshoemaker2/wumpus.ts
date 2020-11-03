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

class GameEventGenerator {

    private currentEvent: GameEvent;

    public constructor(initialEvent: GameEvent) {
        this.currentEvent = initialEvent;
    }

    public *getIterator(cave: WumpusCave): Iterator<GameEvent>
    {
        for(;;) {
            yield this.currentEvent;
            this.currentEvent = this.currentEvent.perform(cave);
        }
    }
}


/**
 * Processes a game event to completion.
 */
export class GameEventProcessor implements PlayerAction {

    private initialEvent: GameEvent;

    constructor(initialEvent: GameEvent) {
        this.initialEvent = initialEvent;
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        const gameEventGenerator = new GameEventGenerator(this.initialEvent);

        // TODO make this a parameter to this method.
        const gameEventDisplay = new GameEventDisplayImpl(display);

        let playerIdle: boolean = false;
        let gameRunning: boolean = false;
        const gameEventIterator = gameEventGenerator.getIterator(cave);
        do {
            const gameEvent = gameEventIterator.next().value;
            gameEventDisplay.displayGameEvent(gameEvent);
            gameRunning = this.isGameRunning(gameEvent);
            playerIdle = this.isPlayerIdle(gameEvent);
        } while(gameRunning && !playerIdle);

        return gameRunning;
    }

    private isGameRunning(gameEvent: GameEvent): boolean {
        return !(gameEvent instanceof GameOverEvent);
    }

    private isPlayerIdle(gameEvent: GameEvent) {
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

/**
 * Implements PlayerActionFactory.
 */
export class PlayerActionFactoryImpl implements PlayerActionFactory {

    createPlayerAction(command: WumpusCommand): PlayerAction {
        if(command.type === WumpusCommandType.Move) {
            const roomNumber = command.args[0];
            return new GameEventProcessor(new PlayerMovedToRoomEvent(roomNumber));
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
