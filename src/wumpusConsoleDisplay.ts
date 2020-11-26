
import { WumpusRoom } from './wumpusRoom'
import { WumpusDisplay } from './wumpusDisplay'
import { WumpusOptions } from './wumpusOptions'
import { ConsoleWrite } from './consoleUtils';
import { GameState } from './gameState'

/**
 * WumpusDisplay implementation that outputs to the console.
 */
export class WumpusConsoleDisplay implements WumpusDisplay {

    private writeConsole: ConsoleWrite;

    public constructor(theConsole: ConsoleWrite) {
        this.writeConsole = theConsole;
    }

    public showIntroduction(options: WumpusOptions): void {
        this.writeConsole(`Hunt the Wumpus!

You're in a cave with ${options.numRooms} rooms and ${options.numDoors} tunnels leading from each room.
There are ${options.numBats} bats and ${options.numPits} pits scattered throughout the cave, and your
quiver holds ${options.numArrows} custom super anti-evil Wumpus arrows. Good luck.\n`);
    }

    public showGameState(gameState: GameState): void {
        const currentRoom = gameState.cave.getCurrentRoom();
        this.writeConsole(`You are in room ${currentRoom.getRoomNumber()} of the cave`);
        
        const neighbors: WumpusRoom[] = currentRoom.getNeighbors();
        this.printNeighbors(neighbors);

        if(currentRoom.pitNearby()) {
            this.writeConsole("*whoosh* (I feel a draft from some pits).");
        }
        if(currentRoom.batsNearby()) {
            this.writeConsole("*rustle* *rustle* (must be bats nearby).");
        }
        if(currentRoom.wumpusNearby()) {
            this.writeConsole("*sniff* (I can smell the evil Wumpus nearby!)");
        }

        // Write a blank line
        this.writeConsole("");
    }

    private printNeighbors(neighbors: WumpusRoom[]) {
        if(neighbors.length > 0) {
            let output: string = `There are tunnels leading to rooms ${neighbors[0].getRoomNumber()}`;
            for(let i = 1; i < neighbors.length; i++) {
                output += `, ${neighbors[i].getRoomNumber()}`
            }
            this.writeConsole(output);
        }
    }

    public showPlayerHitWall(): void {
        this.writeConsole("Oof! (you hit the wall)\n")
    }

    showPlayerSurvivedPit(): void {
        this.writeConsole(`Without conscious thought you grab for the side of the cave and manage\n\
to grasp onto a rocky outcrop.  Beneath your feet stretches the limitless\n\
depths of a bottomless pit!  Rock crumbles beneath your feet!\n`);
    }

    public showPlayerFellInPit(): void {
        this.writeConsole(`*AAAUUUUGGGGGHHHHHhhhhhhhhhh...*
The whistling sound and updraft as you walked into this room of the
cave apparently wasn't enough to clue you in to the presence of the
bottomless pit.  You have a lot of time to reflect on this error as
you fall many miles to the core of the earth.  Look on the bright side;
you can at least find out if Jules Verne was right...\n`);
    }

    public showPlayerMovedByBats(): void {
        this.writeConsole("*flap*  *flap*  *flap*  (humongous bats pick you up and move you!)\n");
    }

    public showPlayerMovedByBatsAgain(): void {
        this.writeConsole("*flap*  *flap*  *flap*  (humongous bats pick you up and move you again!)\n");
    }

    public showPlayerEatenByWumpus(): void {
        this.writeConsole(`*ROAR* *chomp* *snurfle* *chomp*!\n\
Much to the delight of the Wumpus, you walked right into his mouth,\n\
making you one of the easiest dinners he's ever had!  For you, however,\n\
it's a rather unpleasant death.  The only good thing is that it's been\n\
so long since the evil Wumpus cleaned his teeth that you immediately\n\
passed out from the stench`);
    }

    public showArrowWentNowhere(): void {
        this.writeConsole("The arrow falls to the ground at your feet!\n");
    }

    public showArrowEnteredRandomRoom(fromRoomNum: number,
                                      toRoomNum: number,
                                      enteredRoomNum: number): void
    {
        this.writeConsole(`*thunk*  The arrow can't find a way from ${fromRoomNum} to ${toRoomNum} and flys randomly\n\
into room ${enteredRoomNum}!\n`)
    }

    public showPlayerOutOfArrows(): void {
        this.writeConsole(`\nYou turn and look at your quiver, and realize with a sinking feeling\n\
that you've just shot your last arrow (figuratively, too).  Sensing this\n\
with its psychic powers, the evil Wumpus rampagees through the cave, finds\n\
you, and with a mighty *ROAR* eats you alive!\n`);
    }

    public showPlayerShotWumpus(): void {
        this.writeConsole(`*thwock!* *groan* *crash*\n\n\
A horrible roar fills the cave, and you realize, with a smile, that you\n\
have slain the evil Wumpus and won the game!  You don't want to tarry for\n\
long, however, because not only is the Wumpus famous, but the stench of\n\
dead Wumpus is also quite well known, a stench plenty enough to slay the\n\
mightiest adventurer at a single whiff!!\n`);
    }

    public showPlayerShotSelf(): void {
        this.writeConsole(`\n*Thwack!*  A sudden piercing feeling informs you that the ricochet\n\
of your wild arrow has resulted in it wedging in your side, causing\n\
extreme agony.  The evil Wumpus, with its psychic powers, realizes this\n\
and immediately rushes to your side, not to help, alas, but to EAT YOU!\n\
(*CHOMP*)\n`);
    }


}
