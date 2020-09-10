
import * as sinon from 'sinon';
import { expect } from 'chai';
import { WumpusConsoleDisplay, ConsoleWrite, ConsolePrompt } from './wumpusConsoleDisplay';
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom';
import { WumpusOptions } from './wumpusOptions';
import { WumpusAction } from './wumpusAction';

class ConsoleWriteFake {
    private consoleOutput: string = "";

    public getConsoleOutput(): string { return this.consoleOutput; }

    public getConsoleWriteFunction(): ConsoleWrite {
        return (s: string) => { this.consoleOutput += s + '\n'; };
    }
}

describe('WumpusConsoleDisplay', () => {

    let consoleWriteFake: ConsoleWriteFake;
    let consolePromptFake: sinon.SinonStub;
    let display: WumpusConsoleDisplay;
    let options: WumpusOptions;

    beforeEach(() => {
        consoleWriteFake = new ConsoleWriteFake();
        consolePromptFake = sinon.stub();
        display = new WumpusConsoleDisplay(consoleWriteFake.getConsoleWriteFunction(),
                                           consolePromptFake);
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

    describe('getUserAction', () => {

        const promptText = "-> Move or shoot? [ms?q] ";
        const invalidCommandText = " > I don't understand. Try '?' for help.\n\n";

        it('Responds to \'q\' by exiting', () => {
            consolePromptFake.withArgs(promptText)
                .returns(new Promise<string>((resolve) => { resolve("q"); }));
            const action = display.getUserAction();
            return action.then(result => expect(result).equals(WumpusAction.Quit));
        });

        it('Responds to invalid command by prompting again', () => {
            consolePromptFake.onFirstCall().returns(new Promise<string>((resolve) => { resolve("asdf"); }));
            consolePromptFake.onSecondCall().returns(new Promise<string>((resolve) => { resolve("q"); }));

            const action = display.getUserAction();
            return action.then((result) => {
                expect(result).equals(WumpusAction.Quit);
                expect(consolePromptFake.firstCall.lastArg).equals(promptText);
                expect(consolePromptFake.secondCall.lastArg).equals(promptText);
                expect(consoleWriteFake.getConsoleOutput()).equals(invalidCommandText);
            });
        });
    });

});
