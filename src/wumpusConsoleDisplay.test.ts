
import * as sinon from 'sinon';
import { expect } from 'chai';
import { WumpusConsoleDisplay } from './wumpusConsoleDisplay';
import { ConsoleWrite } from "./consoleUtils";
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom';
import { WumpusOptions } from './wumpusOptions';

// TODO Nuke this class and use SinonStub
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
        display = new WumpusConsoleDisplay(consoleWriteFake.getConsoleWriteFunction());
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
});
