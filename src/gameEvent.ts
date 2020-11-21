import { WumpusCave } from './wumpusCave'
import { getRandomIntBetween } from './wumpusRandom'
import { GameState } from './gameState'

export interface GameEvent {

    /**
     * Performs the event and returns the next one.
     */
    perform(gameState: GameState): GameEvent;
}

export class GameOverEvent implements GameEvent {

    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return undefined;
    }
}

export class PlayerHitWallEvent implements GameEvent {

    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new PlayerIdleEvent();
    }
}

export class PlayerEnteredPitRoomEvent implements GameEvent {
    public perform(gameState: GameState): GameEvent {
        gameState; // Unused

        if(getRandomIntBetween(0, 5) % 6 === 0) {
            return new PlayerSurvivedPitEvent();
        } else {
            return new PlayerFellInPitEvent();
        }
    }
}

export class PlayerSurvivedPitEvent implements GameEvent {

    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new PlayerIdleEvent();
    }
}

export class PlayerFellInPitEvent implements GameEvent {

    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new GameOverEvent();
    }
}

export class MovedByBatsEvent implements GameEvent {

    public perform(gameState: GameState): GameEvent {
        gameState.cave.movePlayerToRandomRoom();
        return new PlayerEnteredRoomEvent();
    }
}

export class PlayerIdleEvent implements GameEvent {

    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return undefined;
    }
}

export class PlayerMovedToRoomEvent implements GameEvent {

    private roomNumber: number;

    constructor(roomNumber: number) {
        this.roomNumber = roomNumber;
    }

    public perform(gameState: GameState): GameEvent {
        let result: GameEvent;

        if(gameState.cave.adjacentRoom(this.roomNumber)) {
            gameState.cave.move(this.roomNumber);
            return new PlayerEnteredRoomEvent();
        } else {
            result = new PlayerHitWallEvent();
        }

        return result;
    }
}

export class PlayerEnteredRoomEvent implements GameEvent {
    public perform(gameState: GameState): GameEvent {
        let result: GameEvent;
        const currentRoom = gameState.cave.getCurrentRoom();
        if(currentRoom.hasPit()) {
            result = new PlayerEnteredPitRoomEvent();
        } else if(currentRoom.hasBats()) {   
            result = new MovedByBatsEvent();
        } else if(currentRoom.hasWumpus()) {
            result = new PlayerEatenByWumpus();
        } else {
            result = new PlayerIdleEvent();
        }
        return result;
    }
}

export class PlayerEatenByWumpus implements GameEvent {
    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new GameOverEvent();
    }
}
