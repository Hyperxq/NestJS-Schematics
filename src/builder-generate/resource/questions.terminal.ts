import { bold, cyan, green } from 'ansi-colors';
import { askConfirmation, askInput, askList, colors } from '../../utils';

export async function ResourceQuestion(): Promise<string> {
  const message = bold(green('What name would you like to use for this resource-old?'));

  return await askInput<string>({
    message,
  });
}

export async function ChooseFolderQuestion(folders: string[]): Promise<string> {
  if (folders.length === 0) {
    return '';
  }
  const message = bold(green('Which folder do you want to choose'));
  const choices = [...folders, '[root]'].map((folder) => ({
    name: cyan(folder),
    value: folder === '[root]' ? '' : folder,
  }));

  return await askList<string>(message, choices, folders[0]);
}

export async function ChooseSchemaQuestion<T = string>(schemas: { name: string; value: T }[]): Promise<T> {
  const message = bold(green('Which schema do you want to choose'));

  return await askList<T>(message, schemas, schemas[0].value);
}

export async function AskForNotIndexesQuestion() {
  const message = bold(
    colors.green(
      // eslint-disable-next-line max-len
      `Would you like to use all properties as keys in the DTO instead?`,
    ),
  );

  return await askConfirmation(message, false);
}
