import * as sinon from 'sinon'
import { expect } from 'chai'
import { WumpusConsoleDisplay } from './wumpusConsoleDisplay'
import { WumpusRoom, WumpusRoomImpl } from './wumpusRoom'
import { WumpusOptions } from './wumpusOptions'

describe('WumpusConsoleDisplay', () => {

    let consoleWriteFake: sinon.SinonStub;
    let display: WumpusConsoleDisplay;
    let options: WumpusOptions;

    beforeEach(() => {
        consoleWriteFake = sinon.stub();
        display = new WumpusConsoleDisplay(consoleWriteFake);
        options = new WumpusOptions();
    });

    function expectConsoleWrites(writes: string[]) {
        const calls = consoleWriteFake.getCalls();
        expect(calls.length, `Console written to ${calls.length} times but expected ${writes.length} times`)
            .equals(writes.length);

        for(let callNum = 0; callNum < calls.length; callNum++) {
            const args = calls[callNum].args;
            expect(args.length, "consoleWrite only takes one argument").equals(1);
            expect(args[0], `Unexpected console write for call ${callNum}`).equals(writes[callNum]);
        }
    }

    function expectConsoleWrite(write: string) {
        expectConsoleWrites([write]);
    }

    describe('showIntroduction', () => {
        it('displays the game options in the introduction', () => {
            display.showIntroduction(options);

            expectConsoleWrite(`Hunt the Wumpus!

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your
quiver holds ${options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n`);
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
            expect(consoleWriteFake.calledOnce, "Expected console written to once").equals(true);
            const message = consoleWriteFake.getCall(0).args[0];
            expect(message).equals(expected);

            expectConsoleWrite('You are in room 10 of the cave');
        });

        it('displays a message if a pit is nearby', () => {
            let pitRoom: WumpusRoomImpl = new WumpusRoomImpl(12);
            pitRoom.setPit(true);
            room.addNeighbor(pitRoom);
            room.addNeighbor(new WumpusRoomImpl(13));
            room.addNeighbor(new WumpusRoomImpl(14));

            display.showRoomEntry(room);

            expectConsoleWrites(['You are in room 10 of the cave',
                                 'There are tunnels leading to rooms 12, 13, 14',
                                 '*whoosh* (I feel a draft from some pits).']);
        });

        it('displays a message if bats are nearby', () => {
            let batRoom: WumpusRoomImpl = new WumpusRoomImpl(12);
            batRoom.setBats(true);
            room.addNeighbor(batRoom);
            room.addNeighbor(new WumpusRoomImpl(13));
            room.addNeighbor(new WumpusRoomImpl(14));

            display.showRoomEntry(room);

            expectConsoleWrites(['You are in room 10 of the cave',
                                 'There are tunnels leading to rooms 12, 13, 14',
                                 '*rustle* *rustle* (must be bats nearby).']);
        });

        it('displays the room and the neighbors', () => {
            room.addNeighbor(new WumpusRoomImpl(1));
            room.addNeighbor(new WumpusRoomImpl(2));
            room.addNeighbor(new WumpusRoomImpl(3));

            display.showRoomEntry(room);

            expectConsoleWrites(['You are in room 10 of the cave',
                                 'There are tunnels leading to rooms 1, 2, 3']);

        });
    });

    it('displays on the console when the player hits a wall', () => {
        display.showPlayerHitWall();

        expectConsoleWrite('Oof! (you hit the wall)\n');
    });

    it('displays on the console when the player survives a pit', () => {
        display.showPlayerSurvivedPit();

        expectConsoleWrite(`Without conscious thought you grab for the side of the cave and manage\n\
to grasp onto a rocky outcrop.  Beneath your feet stretches the limitless\n\
depths of a bottomless pit!  Rock crumbles beneath your feet!\n`);
    });

    it('displays on the console when the player falls in a pit', () => {
        display.showPlayerFellInPit();

        expectConsoleWrite(`*AAAUUUUGGGGGHHHHHhhhhhhhhhh...*
The whistling sound and updraft as you walked into this room of the
cave apparently wasn't enough to clue you in to the presence of the
bottomless pit.  You have a lot of time to reflect on this error as
you fall many miles to the core of the earth.  Look on the bright side;
you can at least find out if Jules Verne was right...\n`);
    });

    it('displays on the console when the player is moved by bats', () => {
        display.showPlayerMovedByBats();

        expectConsoleWrite('*flap*  *flap*  *flap*  (humongous bats pick you up and move you!)\n');
    });

});
