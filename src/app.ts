
import { Game } from './game'
import { WumpusOptions } from './wumpusOptions'
import { WumpusCaveImpl } from './wumpusCave'
import { CaveCreator } from './caveCreator';
import { WumpusConsoleDisplay, ConsoleWrite, ConsolePrompt } from './wumpusConsoleDisplay'

const consoleWrite: ConsoleWrite = (message: string): void => {
    console.log(message);
}

const consolePrompt: ConsolePrompt = async function askQuestion(query): Promise<string> {
    const createInterface = require('readline').createInterface;

    let rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

/**
 * App entry point.
 */
class App {
    public static start() {
        let options: WumpusOptions = new WumpusOptions();
        let cave: WumpusCaveImpl = new WumpusCaveImpl(CaveCreator.createCave(options));
        let display: WumpusConsoleDisplay = new WumpusConsoleDisplay(consoleWrite, consolePrompt);

        let game: Game = new Game(options, cave, display);
        game.run();
    }
}

App.start();
