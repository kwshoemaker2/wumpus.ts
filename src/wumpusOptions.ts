
export const maxShotPath = 6;
export const defaultNumRooms = 20;
export const defaultNumDoors = 3;
export const defaultNumArrows = 5;
export const defaultNumPits = 3;
export const defaultNumBats = 3;

/**
 * Options for a game of Hunt the Wumpus
 */
export class WumpusOptions {
    public shotPath: number;
    public numRooms: number;
    public numArrows: number;
    public numDoors: number;
    public numPits: number;
    public numBats: number;

    public constructor() {
        this.shotPath = maxShotPath;
        this.numRooms = defaultNumRooms;
        this.numArrows = defaultNumArrows;
        this.numDoors = defaultNumDoors;
        this.numPits = defaultNumPits;
        this.numBats = defaultNumBats;
    }
}
