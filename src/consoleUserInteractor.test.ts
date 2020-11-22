import * as sinon from 'sinon';
import { expect } from 'chai';
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';
import { ConsoleUserInteractor } from './consoleUserInteractor'

describe('ConsoleUserInteractor', () => {

    let consoleWriteFake: sinon.SinonStub;
    let consolePromptFake: sinon.SinonStub;
    let userInteractor: ConsoleUserInteractor;
    const promptText = "Move or shoot? (m-s) ";

    beforeEach(() => {
        consoleWriteFake = sinon.stub();
        consolePromptFake = sinon.stub();
        userInteractor = new ConsoleUserInteractor(consoleWriteFake, consolePromptFake);
    });

    function makeConsolePromptAnswer(answer: string): Promise<string>
    {
        return new Promise<string>((resolve) => { resolve(answer); } );
    }

    function validateMoveCommand(command: WumpusCommand, expectedRoom: number): void
    {
        expect(command.type).equals(WumpusCommandType.Move);
        expect(command.args.length).equals(1);
        const roomArg = command.args[0];
        expect(roomArg).equals(expectedRoom);
    }

    function validateShootCommand(command: WumpusCommand, expectedRooms: number[]): void
    {
        expect(command.type).equals(WumpusCommandType.Shoot);
        expect(command.args).to.eql(expectedRooms);
    }

    it('responds to "q" by exiting', async () => {
        consolePromptFake.withArgs(promptText)
            .returns(makeConsolePromptAnswer("q"));

        const command = await userInteractor.getUserCommand();

        expect(command.type).equals(WumpusCommandType.Quit)
    });

    it('parses "m 1" into the right action', async () => {
        consolePromptFake.withArgs(promptText)
            .returns(makeConsolePromptAnswer("m 1"));

        const command = await userInteractor.getUserCommand();

        validateMoveCommand(command, 1);
    });

    it('keeps prompting for room to move to', async () => {
        consolePromptFake.onFirstCall().returns(makeConsolePromptAnswer("m"));
        consolePromptFake.onSecondCall().returns(makeConsolePromptAnswer(""));
        consolePromptFake.onThirdCall().returns(makeConsolePromptAnswer("1"));

        const command = await userInteractor.getUserCommand();

        validateMoveCommand(command, 1);

        expect(consolePromptFake.calledThrice).equals(true);

        expect(consolePromptFake.getCall(1).args[0]).equals("To which room do you wish to move? ");
        expect(consolePromptFake.getCall(2).args[0]).equals("To which room do you wish to move? ");
    });

    it('keeps prompting for room to move to when player doesnt enter a number', async () => {
        consolePromptFake.onFirstCall().returns(makeConsolePromptAnswer("m"));
        consolePromptFake.onSecondCall().returns(makeConsolePromptAnswer("asdf"));
        consolePromptFake.onThirdCall().returns(makeConsolePromptAnswer("1"));

        const command = await userInteractor.getUserCommand();

        validateMoveCommand(command, 1);

        expect(consolePromptFake.calledThrice).equals(true);

        expect(consolePromptFake.getCall(1).args[0]).equals("To which room do you wish to move? ");
        expect(consolePromptFake.getCall(2).args[0]).equals("To which room do you wish to move? ");
    });

    it('parses "s 1" into the right action', async () => {
        consolePromptFake.withArgs(promptText)
            .returns(makeConsolePromptAnswer("s 1"));

        const command = await userInteractor.getUserCommand();

        validateShootCommand(command, [1]);
    });

    it('parses "s 1 2 3" into the right action', async () => {
        consolePromptFake.withArgs(promptText)
            .returns(makeConsolePromptAnswer("s 1 2 3"));

        const command = await userInteractor.getUserCommand();

        validateShootCommand(command, [1, 2, 3]);
    });

    it('parses "s" into the right action', async () => {
        consolePromptFake.withArgs(promptText)
            .returns(makeConsolePromptAnswer("s"));

        const command = await userInteractor.getUserCommand();

        validateShootCommand(command, []);
    });

    it('responds to invalid command by prompting again', async () => {
        consolePromptFake.onFirstCall().returns(makeConsolePromptAnswer("asdf"));
        consolePromptFake.onSecondCall().returns(makeConsolePromptAnswer("q"));

        const command = await userInteractor.getUserCommand();

        expect(command.type).equals(WumpusCommandType.Quit);
        expect(consolePromptFake.firstCall.lastArg).equals(promptText);
        expect(consolePromptFake.secondCall.lastArg).equals(promptText);

        expect(consoleWriteFake.calledOnce).equals(true);
        const message = consoleWriteFake.getCall(0).args[0];
        expect(message).equals("I don't understand!\n");
    });
});