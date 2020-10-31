import { WumpusCave } from './wumpusCave'
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusCommandType, WumpusCommand } from './wumpusCommand'
import { RandomRangeFunction, getRandomIntBetween } from './wumpusUtils'

interface GameEvent {

    /**
     * Performs the event and returns the next one.
     */
    perform(cave: WumpusCave): GameEvent;
}

class GameOverEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return this;
    }
}

class PlayerHitWallEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return new PlayerEnteredRoomEvent();
    }
}

class PlayerFellInPitEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return new GameOverEvent();
    }
}

class MovedByBatsEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave.movePlayerToRandomRoom();
        return new PlayerEnteredRoomEvent();
    }
}

class PlayerEnteredRoomEvent implements GameEvent {

    public perform(cave: WumpusCave): GameEvent {
        cave; // Unused
        return this;
    }
}

class PlayerMovedToRoomEvent implements GameEvent {

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
            result = new PlayerHitWallEvent()
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
            result = new PlayerEnteredRoomEvent();
        }
        return result;
    }
}

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
 * Handles moving the player.
 */
export class MovePlayer implements PlayerAction {

    private playerMovedToRoomEvent: PlayerMovedToRoomEvent;

    constructor(roomNumber: number) {
        this.playerMovedToRoomEvent = new PlayerMovedToRoomEvent(roomNumber);
    }

    perform(cave: WumpusCave, display: WumpusDisplay): boolean {
        let playerMoved: boolean = false;
        let gameOver: boolean = false;
        let gameEvent: GameEvent = this.playerMovedToRoomEvent.perform(cave);
        do {
            this.displayGameEvent(gameEvent, display);
            gameOver = this.isGameOver(gameEvent);
            playerMoved = this.didPlayerMove(gameEvent);
            gameEvent = gameEvent.perform(cave);
        } while(!playerMoved && !gameOver);

        
        return gameOver;
    }

    displayGameEvent(gameEvent: GameEvent, display: WumpusDisplay): void {
        if(gameEvent instanceof PlayerHitWallEvent) {
            display.showPlayerHitWall();
        } else if(gameEvent instanceof PlayerFellInPitEvent) {
            display.showPlayerFellInPit();
        } else if(gameEvent instanceof MovedByBatsEvent) {
            display.showPlayerMovedByBats();
        }
    }

    isGameOver(gameEvent: GameEvent): boolean {
        if(gameEvent instanceof PlayerFellInPitEvent) {
            return false;
        } else {
            return true;
        }
    }

    didPlayerMove(gameEvent: GameEvent) {
        if(gameEvent instanceof PlayerEnteredRoomEvent) {
            return false;
        } else {
            return true;
        }
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
            return new MovePlayer(roomNumber);
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

