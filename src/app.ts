
import { Wumpus } from './wumpus'
import * as wumpusOptions from './wumpusOptions'

/**
 * App entry point.
 */
class App {
    public static start() {
        let options: wumpusOptions.WumpusOptions = new wumpusOptions.WumpusOptions();

        let wumpus: Wumpus = new Wumpus(options);
        wumpus.run();
    }
}

App.start();