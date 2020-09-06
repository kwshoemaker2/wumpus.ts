
export interface WumpusRoom {
    /**
     * Get the number associated with this room.
     */
    getRoomNumber(): number;

    /**
     * Get an array of rooms connected to this room.
     */
    getNeighbors(): WumpusRoom[];

    /**
     * Add the WumpusRoom as a neighbor of this one.
     */
    addNeighbor(neighbor: WumpusRoom): void;
}

export class WumpusRoomImpl implements WumpusRoom {
    private roomNumber: number;
    private neighbors: WumpusRoom[];

    constructor(roomNumber: number) {
        this.roomNumber = roomNumber;
        this.neighbors = [];
    }

    getRoomNumber(): number { return this.roomNumber; }

    getNeighbors(): WumpusRoom[] { return this.neighbors; }

    addNeighbor(neighbor: WumpusRoom): void {
        this.neighbors.push(neighbor);
    }
}
