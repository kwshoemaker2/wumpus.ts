import { WumpusCave } from './wumpusCave'
import { getRandomIntBetween } from './wumpusRandom';

export interface GameEvent {

    /**
     * Performs the event and returns the next one.
     */
    perform(cave: WumpusCave): GameEvent;
}

export class GameOverEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return undefined;
    }
}

export class PlayerHitWallEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return new PlayerIdleEvent();
    }
}

export class PlayerEnteredPitRoomEvent implements GameEvent {
    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused

        if(getRandomIntBetween(0, 5) % 6 === 0) {
            return new PlayerSurvivedPitEvent();
        } else {
            return new PlayerFellInPitEvent();
        }
    }
}

export class PlayerSurvivedPitEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return new PlayerIdleEvent();
    }
}

export class PlayerFellInPitEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return new GameOverEvent();
    }
}

export class MovedByBatsEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave.movePlayerToRandomRoom();
        return new PlayerIdleEvent();
    }
}

export class PlayerIdleEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return undefined;
    }
}

export class PlayerMovedToRoomEvent implements GameEvent {

    private roomNumber: number;

    constructor(roomNumber: number) {
        this.roomNumber = roomNumber;
    }

    public perform(cave: WumpusCave): GameEvent {
        let result: GameEvent;

        if(cave.adjacentRoom(this.roomNumber)) {
            cave.move(this.roomNumber);
            result = this.handleMove(cave);
        } else {
            result = new PlayerHitWallEvent();
        }

        return result;
    }

    private handleMove(cave: WumpusCave): GameEvent {
        let result: GameEvent;
        const currentRoom = cave.getCurrentRoom();
        if(currentRoom.hasPit()) {
            result = new PlayerEnteredPitRoomEvent();
        } else if(currentRoom.hasBats()) {   
            result = new MovedByBatsEvent();
        } else {
            result = new PlayerIdleEvent();
        }
        return result;
    }
}