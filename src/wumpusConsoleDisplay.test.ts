
import { expect } from 'chai'
import { WumpusConsoleDisplay, ConsoleWrite, ConsolePrompt } from './wumpusConsoleDisplay'
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'

class ConsoleWriteFake {
    private consoleOutput: string = "";

    public getConsoleOutput(): string { return this.consoleOutput; }

    public getConsoleWriteFunction(): ConsoleWrite {
        return (s: string) => { this.consoleOutput += s + '\n'; };
    }
}

class ConsolePromptFake {
    private prompt: string = "";
    private answer: string = "";

    public getPrompt(): string { return this.prompt; }

    public setAnswer(answer: string): void { this.answer = answer; }

    public getConsolePromptFunction(): ConsolePrompt {
        return (prompt: string): Promise<string> => {
            this.prompt = prompt;
            return new Promise<string>((resolve) => {
                resolve(this.answer);
            });
        }
    }
}

describe('WumpusConsoleDisplay', () => {

    let consoleWriteFake: ConsoleWriteFake;
    let consolePromptFake: ConsolePromptFake;
    let display: WumpusConsoleDisplay;
    let options: WumpusOptions;

    beforeEach(() => {
        consoleWriteFake = new ConsoleWriteFake();
        consolePromptFake = new ConsolePromptFake();
        display = new WumpusConsoleDisplay(consoleWriteFake.getConsoleWriteFunction(),
                                           consolePromptFake.getConsolePromptFunction());
        options = new WumpusOptions();
    });

    describe('showIntroduction', () => {
        it('displays the game options in the introduction', () => {
            display.showIntroduction(options);

            const expected: string = `Hunt the Wumpus!

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.\n
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your\n
quiver holds ${options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n\n`;

            expect(consoleWriteFake.getConsoleOutput()).equals(expected);
        });
    })

    describe('showRoomEntry', () => {
        let room: WumpusRoom;
        const roomNumber: number = 10;
        beforeEach(() => {
            room = new WumpusRoomImpl(roomNumber);
        });

        it('displays just the room if the room is empty', () => {
            display.showRoomEntry(room);

            const expected: string = 'You are in room 10 of the cave\n';
            expect(consoleWriteFake.getConsoleOutput()).equals(expected);
        });

        it('displays the room and the neighbors', () => {
            room.addNeighbor(new WumpusRoomImpl(1));
            room.addNeighbor(new WumpusRoomImpl(2));
            room.addNeighbor(new WumpusRoomImpl(3));

            display.showRoomEntry(room);

            const expected: string = 'You are in room 10 of the cave\n' +
                                     'There are tunnels leading to rooms 1, 2, 3\n';
            expect(consoleWriteFake.getConsoleOutput()).equals(expected);
        });
    });

});
