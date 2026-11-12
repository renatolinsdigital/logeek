import { describe, expect, it } from 'vitest';
import type { Variable } from '@/domain/models';
import {
  getDefaultOperator,
  getDefaultValue,
  getOperatorLabel,
  isOperatorAllowed,
  parseTypedValue,
  validateVariableName,
  VARIABLE_TYPES,
} from './operators';

describe('operators', () => {
  it('lists every variable type', () => {
    expect(VARIABLE_TYPES).toEqual(['number', 'text', 'boolean']);
  });

  it('labels equality as symbols for numbers and as words otherwise', () => {
    expect(getOperatorLabel('==', 'number')).toBe('=');
    expect(getOperatorLabel('!=', 'number')).toBe('≠');
    expect(getOperatorLabel('>=', 'number')).toBe('>=');
    expect(getOperatorLabel('==', 'text')).toBe('is');
    expect(getOperatorLabel('!=', 'boolean')).toBe('is not');
    expect(getOperatorLabel('contains', 'text')).toBe('contains');
  });

  it('allows only the operators that fit a type', () => {
    expect(isOperatorAllowed('>', 'number')).toBe(true);
    expect(isOperatorAllowed('contains', 'number')).toBe(false);
    expect(isOperatorAllowed('contains', 'text')).toBe(true);
    expect(isOperatorAllowed('<', 'boolean')).toBe(false);
  });

  it('starts each type with its first operator and a neutral value', () => {
    expect(getDefaultOperator('number')).toBe('>');
    expect(getDefaultOperator('text')).toBe('==');
    expect(getDefaultOperator('boolean')).toBe('==');
    expect(getDefaultValue('number')).toBe('0');
    expect(getDefaultValue('text')).toBe('');
    expect(getDefaultValue('boolean')).toBe('true');
  });
});

describe('parseTypedValue', () => {
  it('reads numbers, trimming spaces, and refuses what is not a finite number', () => {
    expect(parseTypedValue(' 12.5 ', 'number')).toBe(12.5);
    expect(parseTypedValue('-3', 'number')).toBe(-3);
    expect(parseTypedValue('', 'number')).toBeNull();
    expect(parseTypedValue('   ', 'number')).toBeNull();
    expect(parseTypedValue('12abc', 'number')).toBeNull();
    expect(parseTypedValue('Infinity', 'number')).toBeNull();
  });

  it('reads only true and false as switches', () => {
    expect(parseTypedValue('true', 'boolean')).toBe(true);
    expect(parseTypedValue('false', 'boolean')).toBe(false);
    expect(parseTypedValue('yes', 'boolean')).toBeNull();
  });

  it('keeps text exactly as typed', () => {
    expect(parseTypedValue(' BR ', 'text')).toBe(' BR ');
    expect(parseTypedValue('', 'text')).toBe('');
  });
});

describe('validateVariableName', () => {
  const variables: Variable[] = [{ id: 'variable_1', name: 'speed', type: 'number', sample: '' }];

  it('accepts a new name made of letters, digits and underscores', () => {
    expect(validateVariableName('max_speed2', variables)).toBeNull();
    expect(validateVariableName('_hidden', variables)).toBeNull();
  });

  it('says why a name cannot be used', () => {
    expect(validateVariableName('  ', variables)).toBe('Give the variable a name.');
    expect(validateVariableName('2fast', variables)).toBe(
      'Use letters, digits and _ only, starting with a letter (32 at most).',
    );
    expect(validateVariableName('a'.repeat(33), variables)).toBe(
      'Use letters, digits and _ only, starting with a letter (32 at most).',
    );
    expect(validateVariableName('Speed', variables)).toBe(
      'There is already a variable called Speed.',
    );
  });

  it('lets a variable keep its own name', () => {
    expect(validateVariableName('Speed', variables, 'variable_1')).toBeNull();
  });
});
