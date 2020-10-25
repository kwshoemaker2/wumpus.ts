
import { createInterface } from 'readline';
import { Game } from './game';
import { WumpusOptions } from './wumpusOptions';
import { WumpusCaveImpl } from './wumpusCave';
import { CaveCreator } from './caveCreator';
import { WumpusConsoleDisplay, ConsoleWrite, ConsolePrompt } from './wumpusConsoleDisplay';
import { PlayerActionFactoryImp } from './playerAction';

/**
 * App entry point.
 */
class App {

    private static consoleWrite: ConsoleWrite = (message: string): void => {
        console.log(message);
    }

    private static readline = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    private static consolePrompt: ConsolePrompt = async function askQuestion(query): Promise<string> {
        return new Promise((resolve) => App.readline.question(query, ans => {
            resolve(ans);
        }));
    }

    public static async start() {
        let options: WumpusOptions = new WumpusOptions();
        let cave: WumpusCaveImpl = new WumpusCaveImpl(CaveCreator.createCave(options));
        let display: WumpusConsoleDisplay = new WumpusConsoleDisplay(App.consoleWrite, App.consolePrompt);
        let playerActionFactory = new PlayerActionFactoryImp();

        let game: Game = new Game(cave, display, playerActionFactory);

        display.showIntroduction(options);

        await game.run();
        
        App.shutdown();
    }

    private static shutdown() {
        App.readline.close();
    }
}

App.start();

