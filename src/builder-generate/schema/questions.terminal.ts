import { bold, green } from 'ansi-colors';
import { askInput } from '../../utils';

export async function SchemaQuestion(): Promise<string> {
  const message = bold(green('What name would you like to use for this schema?'));

  return await askInput<string>({
    message,
  });
}
