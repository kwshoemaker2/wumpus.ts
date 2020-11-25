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

export class PlayerShotArrowEvent implements GameEvent {
    private nextRoom: number;
    private rooms: number[];
    public constructor(rooms: number[]) {
        this.nextRoom = rooms[0];
        this.rooms = rooms.slice(1);
    }

    public perform(gameState: GameState): GameEvent {
        gameState.numArrows--;
        if(gameState.cave.adjacentRoom(this.nextRoom)) {
            return new ArrowEnteredRoomEvent(this.nextRoom, this.rooms);
        } else {
            const currentRoom = gameState.cave.getCurrentRoom();
            const currentRoomNeighbors = currentRoom.getNeighbors();
            const shootRoomNum = currentRoomNeighbors[getRandomIntBetween(0, currentRoomNeighbors.length)].getRoomNumber();
            return new ArrowEnteredRandomRoomEvent(currentRoom.getRoomNumber(),
                                                   this.nextRoom,
                                                   shootRoomNum);
        }
    }
}

export class ArrowEnteredRoomEvent implements GameEvent {
    private currentRoomNum: number;
    private nextRoomNum: number;
    private nextRooms: number[];
    public constructor(currentRoom: number, nextRooms: number[]) {
        this.currentRoomNum = currentRoom;
        this.nextRoomNum = nextRooms[0];
        this.nextRooms = nextRooms.slice(1);
    }

    public getCurrentRoom(): number { return this.currentRoomNum; }
    public getNextRoom(): number { return this.nextRoomNum; }

    public perform(gameState: GameState): GameEvent {
        const enteredRoom = gameState.cave.getRoom(this.currentRoomNum);
        if(enteredRoom.hasWumpus()) {
            return new PlayerShotWumpusEvent();
        }

        const nextRoom = gameState.cave.getRoom(this.nextRoomNum);
        if(nextRoom) {
            if(enteredRoom.hasNeighbor(nextRoom))  {
                return new ArrowEnteredRoomEvent(this.nextRoomNum, this.nextRooms);
            } else {
                const enteredRoomNeighbors = enteredRoom.getNeighbors();
                const nextRoomNum = enteredRoomNeighbors[getRandomIntBetween(0, enteredRoomNeighbors.length)].getRoomNumber();
                return new ArrowEnteredRandomRoomEvent(this.currentRoomNum, this.nextRoomNum, nextRoomNum);
            }
        } else {
            return new PlayerIdleEvent();
        }
    }
}

export class ArrowEnteredRandomRoomEvent implements GameEvent {

    private fromRoom: number;
    private toRoom: number;
    private nextRoom: number;
    public constructor(fromRoom: number, toRoom: number, nextRoom: number) {
        this.fromRoom = fromRoom;
        this.toRoom = toRoom;
        this.nextRoom = nextRoom;
    }

    public getFromRoom(): number { return this.fromRoom; }
    public getToRoom(): number { return this.toRoom; }
    public getNextRoom(): number { return this.nextRoom; }

    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new ArrowEnteredRoomEvent(this.nextRoom, []);
    }
}

export class PlayerShotWumpusEvent implements GameEvent {
    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new GameOverEvent();
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
