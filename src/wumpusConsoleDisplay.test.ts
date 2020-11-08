
import * as sinon from 'sinon';
import { expect } from 'chai';
import { WumpusConsoleDisplay } from './wumpusConsoleDisplay';
import { ConsoleWrite } from "./consoleUtils";
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom';
import { WumpusOptions } from './wumpusOptions';

describe('WumpusConsoleDisplay', () => {

    let consoleWriteFake: sinon.SinonStub;
    let display: WumpusConsoleDisplay;
    let options: WumpusOptions;

    beforeEach(() => {
        consoleWriteFake = sinon.stub();
        display = new WumpusConsoleDisplay(consoleWriteFake);
        options = new WumpusOptions();
    });

    describe('showIntroduction', () => {
        it('displays the game options in the introduction', () => {
            display.showIntroduction(options);

            const expected: string = `Hunt the Wumpus!

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your
quiver holds ${options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n`;
            expect(consoleWriteFake.calledOnce).equals(true);
            const message = consoleWriteFake.getCall(0).args[0];
            expect(message).equals(expected);
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

            const expected: string = 'You are in room 10 of the cave';
            expect(consoleWriteFake.calledOnce).equals(true);
            const message = consoleWriteFake.getCall(0).args[0];
            expect(message).equals(expected);
        });

        it('displays a message if a pit is nearby', () => {
            let pitRoom: WumpusRoomImpl = new WumpusRoomImpl(12);
            pitRoom.setPit(true);
            room.addNeighbor(pitRoom);
            room.addNeighbor(new WumpusRoomImpl(13));
            room.addNeighbor(new WumpusRoomImpl(14));

            display.showRoomEntry(room);

            expect(consoleWriteFake.calledThrice).equals(true);
            const line1 = consoleWriteFake.getCall(0).args[0];
            expect(line1).equals('You are in room 10 of the cave');
            const line2 = consoleWriteFake.getCall(1).args[0];
            expect(line2).equals('There are tunnels leading to rooms 12, 13, 14');
            const line3 = consoleWriteFake.getCall(2).args[0];
            expect(line3).equals('*whoosh* (I feel a draft from some pits).');
        });

        it('displays a message if bats are nearby', () => {
            let batRoom: WumpusRoomImpl = new WumpusRoomImpl(12);
            batRoom.setBats(true);
            room.addNeighbor(batRoom);
            room.addNeighbor(new WumpusRoomImpl(13));
            room.addNeighbor(new WumpusRoomImpl(14));

            display.showRoomEntry(room);

            expect(consoleWriteFake.calledThrice).equals(true);
            const line1 = consoleWriteFake.getCall(0).args[0];
            expect(line1).equals('You are in room 10 of the cave');
            const line2 = consoleWriteFake.getCall(1).args[0];
            expect(line2).equals('There are tunnels leading to rooms 12, 13, 14');
            const line3 = consoleWriteFake.getCall(2).args[0];
            expect(line3).equals('*rustle* *rustle* (must be bats nearby).');
        });

        it('displays the room and the neighbors', () => {
            room.addNeighbor(new WumpusRoomImpl(1));
            room.addNeighbor(new WumpusRoomImpl(2));
            room.addNeighbor(new WumpusRoomImpl(3));

            display.showRoomEntry(room);

            const expected: string = 'You are in room 10 of the cave\n' +
                                     'There are tunnels leading to rooms 1, 2, 3\n';

            expect(consoleWriteFake.calledTwice).equals(true);
            const line1 = consoleWriteFake.getCall(0).args[0];
            expect(line1).equals('You are in room 10 of the cave');
            const line2 = consoleWriteFake.getCall(1).args[0];
            expect(line2).equals('There are tunnels leading to rooms 1, 2, 3');
        });
    });
});
