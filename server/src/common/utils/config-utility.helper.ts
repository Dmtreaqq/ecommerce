import { validateSync } from 'class-validator';

export const configUtilityHelper = {
  validateConfig: (config: object) => {
    const errors = validateSync(config);
    if (errors.length > 0) {
      const messages = errors
        .map((error) => Object.values(error.constraints ?? {}).join(', '))
        .join('; ');
      throw new Error('Validation failed: ' + messages);
    }
  },

  convertToBoolean(value: string | undefined): boolean | null {
    const trimmedValue = value?.trim();
    if (trimmedValue === 'true') return true;
    if (trimmedValue === 'false') return false;

    return null;
  },

  getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  },
};
