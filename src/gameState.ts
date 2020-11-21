import { WumpusCave } from './wumpusCave'

export class GameState {
    public cave: WumpusCave;

    public constructor(cave: WumpusCave)
    {
        this.cave = cave;
    }
}
