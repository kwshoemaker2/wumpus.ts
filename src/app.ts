
import { Game } from './game'
import { WumpusOptions } from './wumpusOptions'
import { WumpusCaveImpl } from './wumpusCave'
import { CaveCreator } from './caveCreator';
import { WumpusConsoleDisplay } from './wumpusConsoleDisplay'

/**
 * App entry point.
 */
class App {
    public static start() {
        let options: WumpusOptions = new WumpusOptions();
        let cave: WumpusCaveImpl = new WumpusCaveImpl(CaveCreator.createCave(options));
        let display: WumpusConsoleDisplay = new WumpusConsoleDisplay();

        let game: Game = new Game(options, cave, display);
        game.run();
    }
}

App.start();