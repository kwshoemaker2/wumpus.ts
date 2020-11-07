import { WumpusCave } from './wumpusCave'
import { GameEvent,
         PlayerIdleEvent,
         GameOverEvent,
        } from './gameEvent'
import { GameEventDisplay } from './gameEventDisplay';

/**
 * Abstraction for an action a player can perform.
 */
export interface PlayerAction {

    /**
     * Perform the action.
     * 
     * Returns true if the game is still running.
     */
    perform(cave: WumpusCave, gameEventDisplay: GameEventDisplay): boolean;
}

class GameEventGenerator {

    private currentEvent: GameEvent;

    public constructor(initialEvent: GameEvent) {
        this.currentEvent = initialEvent;
    }

    public *getIterator(cave: WumpusCave): Iterator<GameEvent>
    {
        while(this.currentEvent !== undefined) {
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

    public constructor(initialEvent: GameEvent) {
        this.gameEventGenerator = new GameEventGenerator(initialEvent);
    }

    public perform(cave: WumpusCave, gameEventDisplay: GameEventDisplay): boolean {
        let gameRunning: boolean = true;
        const gameEventIterator = this.gameEventGenerator.getIterator(cave);
        let iteratorResult = gameEventIterator.next();
        while(!iteratorResult.done) {
            const gameEvent = iteratorResult.value;
            gameEventDisplay.displayGameEvent(gameEvent);
            if(!this.isGameRunning(gameEvent)) {
                gameRunning = false;
            }
            iteratorResult = gameEventIterator.next();
        }

        return gameRunning;
    }

    private isGameRunning(gameEvent: GameEvent): boolean {
        return !(gameEvent instanceof GameOverEvent);
    }
}
