import { WumpusCommand } from './wumpusCommand'

/**
 * Obtains the desired command from the user.
 */
export interface UserInteractor {
    getUserCommand(): Promise<WumpusCommand>;
}


