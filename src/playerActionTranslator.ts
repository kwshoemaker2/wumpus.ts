import { PlayerAction, PlayerActionImpl } from './playerAction'
import { WumpusCommand, WumpusCommandType } from './wumpusCommand'
import { PlayerMovedToRoomEvent, GameOverEvent } from './gameEvent'
import { UserInteractor } from './userInteractor'

/**
 * Translates a command from the user to a player action.
 */
export interface PlayerActionTranslator {

    /**
     * Get the player action from the user.
     */
    getPlayerAction(): Promise<PlayerAction>;
}

/**
 * Creates a PlayerAction from a WumpusCommand.
 */
class PlayerActionFactory {

    createPlayerAction(command: WumpusCommand): PlayerAction {
        if(command.type === WumpusCommandType.Move) {
            const roomNumber = command.args[0];
            return new PlayerActionImpl(new PlayerMovedToRoomEvent(roomNumber));
        }
        else if(command.type === WumpusCommandType.Quit) {
            return new PlayerActionImpl(new GameOverEvent());
        }
        else
        {
            return undefined;
        }
    }
}

/**
 * Implements PlayerActionTranslator.
 */
export class PlayerActionTranslatorImpl implements PlayerActionTranslator {

    private userInteractor: UserInteractor;
    private playerActionFactory: PlayerActionFactory;

    public constructor(userInteractor: UserInteractor) {
        this.userInteractor = userInteractor;
        this.playerActionFactory = new PlayerActionFactory();
    }

    public async getPlayerAction(): Promise<PlayerAction> {
        return this.playerActionFactory.createPlayerAction(await this.userInteractor.getUserCommand());
    }
}
