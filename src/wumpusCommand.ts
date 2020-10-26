
// FUTURE Consider nuking these and just having WumpusDisplay.getUserCommand return
// the PlayerAction instead.

/**
 * The command types supported by the game.
 */
export enum WumpusCommandType {
    Move = 1,
    Shoot,
    Quit
}

/**
 * Encompasses a command and arguments received from a user.
 */
export class WumpusCommand {
    public type: WumpusCommandType;
    public args: number[];
    
    constructor(type: WumpusCommandType, args: number[])
    {
        this.type = type;
        this.args = args;
    }
}
