import { createInterface } from 'readline'
import { Game } from './game'
import { WumpusOptions } from './wumpusOptions'
import { createCave, StandardRoomsBuilder } from './caveCreator'
import { WumpusConsoleDisplay } from './wumpusConsoleDisplay'
import { ConsoleUserInteractor } from './consoleUserInteractor'
import { ConsoleWrite, ConsolePrompt } from "./consoleUtils"
import { GameEventDisplayImpl } from './GameEventDisplay'
import { PlayerActionTranslatorImpl } from './playerActionTranslator'
import { GameState } from './gameState'

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
        const gameState = new GameState(cave);
        const display: WumpusConsoleDisplay = new WumpusConsoleDisplay(App.consoleWrite);
        const gameEventDisplay = new GameEventDisplayImpl(display);
        const playerActionTranslator = new PlayerActionTranslatorImpl(new ConsoleUserInteractor(App.consoleWrite, App.consolePrompt));

        const game: Game = new Game(gameState, playerActionTranslator, gameEventDisplay);

        display.showIntroduction(options);

        await game.run();
        
        App.shutdown();
    }

    private static shutdown() {
        App.readline.close();
    }
}

App.start();

