import { WumpusCave } from './wumpusCave'
import { defaultNumArrows } from './wumpusOptions'

export class GameState {
    public cave: WumpusCave;
    public numArrows: number;

    public constructor(cave: WumpusCave, numArrows?: number)
    {
        this.cave = cave;
        if(!numArrows) {
            this.numArrows = defaultNumArrows;
        }
    }
}
