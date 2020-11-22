import { expect } from 'chai';
import * as tsSinon from 'ts-sinon'
import { PlayerActionImpl } from './playerAction'
import { WumpusCommand, WumpusCommandType } from './wumpusCommand'
import { UserInteractor } from './userInteractor'
import { PlayerActionTranslatorImpl } from './playerActionTranslator'

describe("PlayerActionTranslatorImpl", () => {

    let userInteractor: tsSinon.StubbedInstance<UserInteractor>;
    let playerActionTranslator: PlayerActionTranslatorImpl;

    beforeEach(() => {
        userInteractor = tsSinon.stubInterface<UserInteractor>();
        playerActionTranslator = new PlayerActionTranslatorImpl(userInteractor);
    });

    function setUserCommand(command: WumpusCommand) {
        const promise = new Promise<WumpusCommand>(resolve => { 
            resolve(command);
        });
        userInteractor.getUserCommand.returns(promise);
    }

    it("translates a quit command successfully", async () => {
        setUserCommand(new WumpusCommand(WumpusCommandType.Quit, []));

        const playerAction = await playerActionTranslator.getPlayerAction();

        expect(playerAction).instanceOf(PlayerActionImpl);
    });

    it("translates a move command successfully", async () => {
        setUserCommand(new WumpusCommand(WumpusCommandType.Move, [1]));

        const playerAction = await playerActionTranslator.getPlayerAction();

        expect(playerAction).instanceOf(PlayerActionImpl);
    });

    it("translates a shoot command successfully", async () => {
        setUserCommand(new WumpusCommand(WumpusCommandType.Shoot, [1]));

        const playerAction = await playerActionTranslator.getPlayerAction();

        expect(playerAction).instanceOf(PlayerActionImpl);
    });

    it("asks the user for their command", async () => {
        setUserCommand(new WumpusCommand(WumpusCommandType.Quit, []));

        await playerActionTranslator.getPlayerAction();

        expect(userInteractor.getUserCommand.calledOnce).equals(true);
    });

});
