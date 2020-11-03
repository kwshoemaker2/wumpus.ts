import * as sinon from 'sinon';
import { expect } from 'chai';
import { ConsoleWrite, ConsolePrompt } from "./consoleUtils";
import { WumpusCommandType, WumpusCommand } from './wumpusCommand';
import { ConsoleUserInteractor } from './consoleUserInteractor'

// TODO Nuke this class and use SinonStub
class ConsoleWriteFake {
    private consoleOutput: string = "";

    public getConsoleOutput(): string { return this.consoleOutput; }

    public getConsoleWriteFunction(): ConsoleWrite {
        return (s: string) => { this.consoleOutput += s + '\n'; };
    }
}

describe('ConsoleUserInteractor', () => {

    let consoleWriteFake: ConsoleWriteFake;
    let consolePromptFake: sinon.SinonStub;
    let userInteractor: ConsoleUserInteractor;

    beforeEach(() => {
        consoleWriteFake = new ConsoleWriteFake();
        consolePromptFake = sinon.stub();
        userInteractor = new ConsoleUserInteractor(consoleWriteFake.getConsoleWriteFunction(),
                                                   consolePromptFake);
    });


    describe('getUserAction', () => {

        const promptText = "-> Move or shoot? [ms?q] ";

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

        it('Responds to "q" by exiting', () => {
            consolePromptFake.withArgs(promptText)
                .returns(makeConsolePromptAnswer("q"));
            const command = userInteractor.getUserCommand();
            return command.then(result => expect(result.type).equals(WumpusCommandType.Quit));
        });

        it('Parses "m 1" into the right action', () => {
            consolePromptFake.withArgs(promptText)
                .returns(makeConsolePromptAnswer("m 1"));
            const command = userInteractor.getUserCommand();
            return command.then((result) => {
                validateMoveCommand(result, 1);
            });
        });

        it('Prompts again when user enters "m"', () => {
            consolePromptFake.onFirstCall().returns(makeConsolePromptAnswer("m"));
            consolePromptFake.onSecondCall().returns(makeConsolePromptAnswer("m 1"));
            const command = userInteractor.getUserCommand();
            return command.then((result) => {
                validateMoveCommand(result, 1);
                expect(consoleWriteFake.getConsoleOutput()).equals("Move where? For example: 'm 1'\n");
            });
        });

        it('Responds to invalid command by prompting again', () => {
            consolePromptFake.onFirstCall().returns(makeConsolePromptAnswer("asdf"));
            consolePromptFake.onSecondCall().returns(makeConsolePromptAnswer("q"));

            const command = userInteractor.getUserCommand();
            return command.then((result) => {
                expect(result.type).equals(WumpusCommandType.Quit);
                expect(consolePromptFake.firstCall.lastArg).equals(promptText);
                expect(consolePromptFake.secondCall.lastArg).equals(promptText);
                expect(consoleWriteFake.getConsoleOutput()).equals(" > I don't understand. Try '?' for help.\n\n");
            });
        });
    });
});