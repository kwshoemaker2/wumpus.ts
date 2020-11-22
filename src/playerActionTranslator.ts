import { PlayerAction, PlayerActionImpl } from './playerAction'
import { WumpusCommand, WumpusCommandType } from './wumpusCommand'
import { PlayerMovedToRoomEvent, GameOverEvent, PlayerShotIntoRoomsEvent } from './gameEvent'
import { UserInteractor } from './userInteractor'
import { assert } from 'console';

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
            return new PlayerActionImpl(new PlayerMovedToRoomEvent(command.args[0]));
        } else if(command.type === WumpusCommandType.Shoot) {
            return new PlayerActionImpl(new PlayerShotIntoRoomsEvent(command.args));
        } else if(command.type === WumpusCommandType.Quit) {
            return new PlayerActionImpl(new GameOverEvent());
        } else {
            assert(false, "Unexpected command");
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
