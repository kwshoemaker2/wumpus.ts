import { WumpusCave } from './wumpusCave'

export interface GameEvent {

    /**
     * Performs the event and returns the next one.
     */
    perform(cave: WumpusCave): GameEvent;
}

export class GameOverEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return this;
    }
}

export class PlayerHitWallEvent implements GameEvent {

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
        return this;
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
            result = new PlayerFellInPitEvent();
        } else if(currentRoom.hasBats()) {   
            result = new MovedByBatsEvent();
        } else {
            result = new PlayerIdleEvent();
        }
        return result;
    }
}