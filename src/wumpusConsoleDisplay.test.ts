
import * as sinon from 'sinon';
import { expect } from 'chai';
import { WumpusConsoleDisplay, ConsoleWrite, ConsolePrompt } from './wumpusConsoleDisplay';
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom';
import { WumpusOptions } from './wumpusOptions';
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';

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

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your
quiver holds ${options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n\n`;

            expect(consoleWriteFake.getConsoleOutput()).equals(expected);
        });
    });

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

        it('displays a message if a pit is nearby', () => {
            let pitRoom: WumpusRoomImpl = new WumpusRoomImpl(12);
            pitRoom.setPit(true);
            room.addNeighbor(pitRoom);
            room.addNeighbor(new WumpusRoomImpl(13));
            room.addNeighbor(new WumpusRoomImpl(14));

            display.showRoomEntry(room);

            const expected: string = 'You are in room 10 of the cave\n' +
                                     'There are tunnels leading to rooms 12, 13, 14\n' +
                                     '*whoosh* (I feel a draft from some pits).\n';
            expect(consoleWriteFake.getConsoleOutput()).equals(expected);
        });

        it('displays a message if bats are nearby', () => {
            let batRoom: WumpusRoomImpl = new WumpusRoomImpl(12);
            batRoom.setBats(true);
            room.addNeighbor(batRoom);
            room.addNeighbor(new WumpusRoomImpl(13));
            room.addNeighbor(new WumpusRoomImpl(14));

            display.showRoomEntry(room);

            const expected: string = 'You are in room 10 of the cave\n' +
                                     'There are tunnels leading to rooms 12, 13, 14\n' +
                                     '*rustle* *rustle* (must be bats nearby).\n';
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

        function makeConsolePromptAnswer(answer: string): Promise<string>
        {
            return new Promise<string>((resolve) => { resolve(answer); } );
        }

        function validateMoveCommand(command: WumpusCommand, expectedRoom: number): void
        {
            expect(command.type).equals(WumpusCommandType.Move);
            expect(command.args.length).equals(1);
            const roomArg = command.args[0];
            expect(roomArg).equals(expectedRoom);
        }

        it('Responds to "q" by exiting', () => {
            consolePromptFake.withArgs(promptText)
                .returns(makeConsolePromptAnswer("q"));
            const command = display.getUserCommand();
            return command.then(result => expect(result.type).equals(WumpusCommandType.Quit));
        });

        it('Parses "m 1" into the right action', () => {
            consolePromptFake.withArgs(promptText)
                .returns(makeConsolePromptAnswer("m 1"));
            const command = display.getUserCommand();
            return command.then((result) => {
                validateMoveCommand(result, 1);
            });
        });

        it('Prompts again when user enters "m"', () => {
            consolePromptFake.onFirstCall().returns(makeConsolePromptAnswer("m"));
            consolePromptFake.onSecondCall().returns(makeConsolePromptAnswer("m 1"));
            const command = display.getUserCommand();
            return command.then((result) => {
                validateMoveCommand(result, 1);
                expect(consoleWriteFake.getConsoleOutput()).equals("Move where? For example: 'm 1'\n");
            });
        });

        it('Responds to invalid command by prompting again', () => {
            consolePromptFake.onFirstCall().returns(makeConsolePromptAnswer("asdf"));
            consolePromptFake.onSecondCall().returns(makeConsolePromptAnswer("q"));

            const command = display.getUserCommand();
            return command.then((result) => {
                expect(result.type).equals(WumpusCommandType.Quit);
                expect(consolePromptFake.firstCall.lastArg).equals(promptText);
                expect(consolePromptFake.secondCall.lastArg).equals(promptText);
                expect(consoleWriteFake.getConsoleOutput()).equals(" > I don't understand. Try '?' for help.\n\n");
            });
        });
    });

});
