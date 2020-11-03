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
export class PlayerActionImpl implements PlayerAction {

    private gameEventGenerator: GameEventGenerator;

    constructor(initialEvent: GameEvent) {
        this.gameEventGenerator = new GameEventGenerator(initialEvent);
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        // TODO make this a parameter to this method.
        const gameEventDisplay = new GameEventDisplayImpl(display);

        let playerIdle: boolean = false;
        let gameRunning: boolean = false;
        const gameEventIterator = this.gameEventGenerator.getIterator(cave);
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
            return new PlayerActionImpl(new PlayerMovedToRoomEvent(roomNumber));
        }
        else if(command.type === WumpusCommandType.Quit) {
            return new PlayerActionImpl(new GameOverEvent());
        }
        else
        {
            return undefined;
        }
    }
}
