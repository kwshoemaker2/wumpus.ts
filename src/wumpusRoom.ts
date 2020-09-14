
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
     * Get the number of neighbors connected to this room.
     */
    numNeighbors(): number;

    /**
     * Add the WumpusRoom as a neighbor of this one.
     */
    addNeighbor(neighbor: WumpusRoom): void;

    /**
     * Returns true if the room is a neighbor of this room.
     */
    hasNeighbor(room: WumpusRoom): boolean;

    /**
     * Set whether the room has a pit.
     */
    setPit(hasPit: boolean): void;

    /**
     * Returns true if the room contains a pit.
     */
    hasPit(): boolean;
}

export class WumpusRoomImpl implements WumpusRoom {
    private roomNumber: number;
    private neighbors: WumpusRoom[];
    private hasPit_: boolean;

    constructor(roomNumber: number) {
        this.roomNumber = roomNumber;
        this.neighbors = [];
        this.hasPit_ = false;
    }

    getRoomNumber(): number { return this.roomNumber; }

    getNeighbors(): WumpusRoom[] { return this.neighbors; }

    numNeighbors(): number { return this.neighbors.length; }

    addNeighbor(neighbor: WumpusRoom): void {
        this.neighbors.push(neighbor);
    }

    hasNeighbor(room: WumpusRoom): boolean {
        for(let i = 0; i < this.numNeighbors(); i++) {
            if(this.neighbors[i].getRoomNumber() === room.getRoomNumber()) {
                return true;
            }
        }
        return false;
    }

    setPit(hasPit: boolean): void { this.hasPit_ = hasPit; }

    hasPit(): boolean { return this.hasPit_; }
}
