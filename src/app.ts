import { createInterface } from 'readline'
import { Game } from './game'
import { WumpusOptions } from './wumpusOptions'
import { createCave, StandardRoomsBuilder } from './caveCreator'
import { WumpusConsoleDisplay } from './wumpusConsoleDisplay'
import { ConsoleUserInteractor } from './consoleUserInteractor'
import { ConsoleWrite, ConsolePrompt } from "./consoleUtils"
import { PlayerActionFactoryImpl } from './playerAction'
import { GameEventDisplayImpl } from './GameEventDisplay'

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
        const options: WumpusOptions = new WumpusOptions();
        const roomsBuilder = new StandardRoomsBuilder(options.numRooms);
        const cave = createCave(options, roomsBuilder);
        const display: WumpusConsoleDisplay = new WumpusConsoleDisplay(App.consoleWrite);
        const userInteractor = new ConsoleUserInteractor(App.consoleWrite, App.consolePrompt);
        const gameEventDisplay = new GameEventDisplayImpl(display);
        const playerActionFactory = new PlayerActionFactoryImpl();

        const game: Game = new Game(cave, userInteractor, playerActionFactory, gameEventDisplay);

        display.showIntroduction(options);

        await game.run();
        
        App.shutdown();
    }

    private static shutdown() {
        App.readline.close();
    }
}

App.start();

