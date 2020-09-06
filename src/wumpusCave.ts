
import { WumpusRoom } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'

export interface WumpusCave {
    /**
     * Returns the room the player is currently in.
     */
    getCurrentRoom(): WumpusRoom;
}

export class WumpusCaveImpl implements WumpusCave {
    private rooms: WumpusRoom[];
    private currentRoom: WumpusRoom;

    constructor(options: WumpusOptions) {
        this.rooms = [];
        this.currentRoom = null;
    }

    getCurrentRoom(): WumpusRoom { return this.currentRoom; }

}
