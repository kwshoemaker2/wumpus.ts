import { getRandomIntBetween } from './wumpusRandom'
import { GameState } from './gameState'
import { WumpusRoom } from './wumpusRoom'
import { assert } from 'console';
import { Game } from './game';

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
        if(this.nextRoom) {
            return this.moveArrow(gameState);
        } else {
            return new ArrowWentNowhereEvent();
        }
    }

    private moveArrow(gameState: GameState): GameEvent {
        if(gameState.cave.adjacentRoom(this.nextRoom)) {
            return new ArrowEnteredRoomEvent(new ShootPath(this.nextRoom, this.rooms));
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

export class ArrowWentNowhereEvent implements GameEvent {
    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new PlayerIdleEvent();
    }
}

export class ShootPath {
    private currentRoom: number;
    private shootRooms: number[];

    public constructor(currentRoom: number, shootRooms: number[]) {
        this.currentRoom = currentRoom;
        this.shootRooms = shootRooms;
    }

    public getCurrentRoom(): number {
        return this.currentRoom;
    }

    public getNextRoom(): number {
        return this.shootRooms[0];
    }

    public endOfPath(): boolean {
        return (this.getNextRoom() === undefined);
    }

    public moveToNextRoom(): void {
        assert(!this.endOfPath(), "This should not be called if we're at the end of the path");
        this.currentRoom = this.shootRooms[0];
        this.shootRooms = this.shootRooms.slice(1);
    }

}

export class ArrowEnteredRoomEvent implements GameEvent {
    private shootPath: ShootPath;
    public constructor(shootPath: ShootPath) {
        this.shootPath = shootPath;
    }

    public getCurrentRoom(): number { return this.shootPath.getCurrentRoom(); }
    public getEnteredRoom(): number { return this.shootPath.getNextRoom(); }

    public perform(gameState: GameState): GameEvent {
        let result: GameEvent = this.checkIfShotSomething(gameState);
        
        if(!result) {
            result = this.moveArrow(gameState);
        }

        return result;
    }

    private checkIfShotSomething(gameState: GameState): GameEvent {
        const currentRoom = gameState.cave.getRoom(this.getCurrentRoom());
        if(currentRoom.hasWumpus()) {
            return new PlayerShotWumpusEvent();
        } else if(currentRoom === gameState.cave.getCurrentRoom()) {
            return new PlayerShotSelfEvent();
        }
    }

    private moveArrow(gameState: GameState): GameEvent {
        const currentRoom = gameState.cave.getRoom(this.getCurrentRoom());
        if(this.shootPath.endOfPath()) {
            return new PlayerIdleEvent();
        } else {
            return this.moveArrowToRoom(gameState, currentRoom);
        }
    }

    private moveArrowToRoom(gameState: GameState, currentRoom: WumpusRoom): GameEvent {
        const nextRoom = gameState.cave.getRoom(this.getEnteredRoom());
        if(currentRoom.hasNeighbor(nextRoom))  {
            return this.moveArrowToNextRoom();
        } else {
            return this.moveArrowToRandomNeighbor(currentRoom);
        }
    }

    private moveArrowToNextRoom(): GameEvent {
        this.shootPath.moveToNextRoom();
        return new ArrowEnteredRoomEvent(this.shootPath);
    }

    private moveArrowToRandomNeighbor(currentRoom: WumpusRoom): GameEvent {
        const enteredRoomNeighbors = currentRoom.getNeighbors();
        const nextRoomNum = enteredRoomNeighbors[getRandomIntBetween(0, enteredRoomNeighbors.length)].getRoomNumber();
        return new ArrowEnteredRandomRoomEvent(this.getCurrentRoom(), this.getEnteredRoom(), nextRoomNum);
    }
}

export class PlayerShotWumpusEvent implements GameEvent {
    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new GameOverEvent();
    }
}

export class PlayerShotSelfEvent implements GameEvent {
    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new GameOverEvent();
    }
}

export class ArrowEnteredRandomRoomEvent implements GameEvent {

    private fromRoom: number;
    private toRoom: number;
    private enterRoom: number;
    public constructor(fromRoom: number, toRoom: number, enterRoom: number) {
        this.fromRoom = fromRoom;
        this.toRoom = toRoom;
        this.enterRoom = enterRoom;
    }

    public getFromRoom(): number { return this.fromRoom; }
    public getToRoom(): number { return this.toRoom; }
    public getEnteredRoom(): number { return this.enterRoom; }

    public perform(gameState: GameState): GameEvent {
        gameState; // Unused
        return new ArrowEnteredRoomEvent(new ShootPath(this.enterRoom, []));
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
