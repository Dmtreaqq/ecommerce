import { Transform } from 'class-transformer';

/**
 * Trims before validation so a whitespace-only value fails `@MinLength` rather
 * than being stored blank.
 */
export const Trimmed = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
