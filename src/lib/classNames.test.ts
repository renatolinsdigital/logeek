import { describe, expect, it } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('joins the truthy class names and drops the rest', () => {
    const isActive = true;
    const isHidden = false;

    expect(classNames('button', isActive && 'active', isHidden && 'hidden', null, undefined)).toBe(
      'button active',
    );
    expect(classNames()).toBe('');
  });
});
