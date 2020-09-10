
export enum WumpusCommand {
    Move = 1,
    Shoot,
    Quit
}

export class WumpusAction {
    public command: WumpusCommand;
    public args: number[];
    
    constructor(command: WumpusCommand, args: number[])
    {
        this.command = command;
        this.args = args;
    }
}
