import { Transform } from 'class-transformer';

/**
 * Normalizes email casing on the way in, which is what makes the unique
 * constraint on `users.email` enforce case-insensitive identity.
 */
export const Lowercased = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  );
