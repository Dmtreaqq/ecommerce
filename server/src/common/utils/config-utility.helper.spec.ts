import { IsNotEmpty, IsNumber } from 'class-validator';
import { configUtilityHelper } from './config-utility.helper.js';

enum Colour {
  Red = 'red',
  Blue = 'blue',
}

class RequiredNameConfig {
  @IsNotEmpty({ message: 'NAME should not be empty' })
  name: string;

  @IsNumber({}, { message: 'PORT should be a number' })
  port: number;
}

describe('configUtilityHelper', () => {
  describe('convertToBoolean', () => {
    it('parses the two boolean literals', () => {
      expect(configUtilityHelper.convertToBoolean('true')).toBe(true);
      expect(configUtilityHelper.convertToBoolean('false')).toBe(false);
    });

    it('ignores surrounding whitespace', () => {
      expect(configUtilityHelper.convertToBoolean('  true  ')).toBe(true);
    });

    // null rather than false, so a malformed value fails @IsBoolean instead of
    // silently being treated as "off".
    it('returns null for a value that is not a boolean literal', () => {
      expect(configUtilityHelper.convertToBoolean('yes')).toBeNull();
      expect(configUtilityHelper.convertToBoolean('1')).toBeNull();
      expect(configUtilityHelper.convertToBoolean('')).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(configUtilityHelper.convertToBoolean(undefined)).toBeNull();
    });

    it('is case sensitive', () => {
      expect(configUtilityHelper.convertToBoolean('TRUE')).toBeNull();
    });
  });

  describe('convertToNumber', () => {
    it('parses a numeric string', () => {
      expect(configUtilityHelper.convertToNumber('3000')).toBe(3000);
    });

    it('returns NaN for undefined', () => {
      expect(configUtilityHelper.convertToNumber(undefined)).toBeNaN();
    });

    it('returns NaN for a non-numeric string', () => {
      expect(configUtilityHelper.convertToNumber('abc')).toBeNaN();
    });
  });

  describe('getEnumValues', () => {
    it('lists the values of an enum', () => {
      expect(configUtilityHelper.getEnumValues(Colour)).toEqual([
        'red',
        'blue',
      ]);
    });
  });

  describe('validateConfig', () => {
    it('accepts a valid object', () => {
      const config = new RequiredNameConfig();
      config.name = 'app';
      config.port = 3000;

      expect(() => configUtilityHelper.validateConfig(config)).not.toThrow();
    });

    it('throws listing every failed constraint', () => {
      const config = new RequiredNameConfig();
      config.name = '';
      config.port = NaN;

      expect(() => configUtilityHelper.validateConfig(config)).toThrow(
        /NAME should not be empty/,
      );
      expect(() => configUtilityHelper.validateConfig(config)).toThrow(
        /PORT should be a number/,
      );
    });
  });
});
