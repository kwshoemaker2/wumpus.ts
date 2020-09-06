
import { Wumpus } from './wumpus'
import { WumpusOptions } from './wumpusOptions'
import { WumpusCaveImpl } from './wumpusCave'
import { CaveCreator } from './caveCreator';

/**
 * App entry point.
 */
class App {
    public static start() {
        let options: WumpusOptions = new WumpusOptions();
        let cave: WumpusCaveImpl = new WumpusCaveImpl(CaveCreator.createCave(options));

        let wumpus: Wumpus = new Wumpus(options, cave);
        wumpus.run();
    }
}

App.start();