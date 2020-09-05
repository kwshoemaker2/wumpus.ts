
const maxShotPath = 6;
const defaultNumRooms = 20;
const defaultNumDoors = 3;
const defaultNumArrows = 3;
const defaultNumPits = 3;
const defaultNumBats = 3;

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
