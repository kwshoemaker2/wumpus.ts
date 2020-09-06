
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'

/**
 * Allows traversing the Wumpus cave.
 */
export interface WumpusCave {
    /**
     * Returns the room the player is currently in.
     */
    getCurrentRoom(): WumpusRoom;
}

export class WumpusCaveImpl implements WumpusCave {
    private rooms: WumpusRoom[];
    private currentRoom: WumpusRoom;

    constructor(rooms: WumpusRoom[]) {
        this.rooms = rooms;
        this.currentRoom = this.rooms[0];
    }

    getCurrentRoom(): WumpusRoom { return this.currentRoom; }

}

