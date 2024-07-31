import { ListQuestionOptions, ListChoiceOptions } from 'inquirer';

declare function askConfirmation(message: string, defaultResponse: boolean): Promise<boolean>;
declare function askInput<T>(options: Omit<ListQuestionOptions, 'type' | 'name' | 'default'> & {
    defaultValue?: T;
}): Promise<T>;
declare function askList<T>(message: string, choices: {
    name: string;
    value: T;
}[], defaultValue: T): Promise<T>;
declare function askQuestion(message: string, choices: ListChoiceOptions[], defaultResponseIndex: number): Promise<string | null>;
declare function askChoices<T>(message: string, choices: {
    name: string;
    value: T;
}[], defaultValue: T[]): Promise<T[] | null>;

export { askChoices, askConfirmation, askInput, askList, askQuestion };
