import { describe, expect, it } from '@jest/globals';

import { toInternational } from '@/lib/phone';

describe('toInternational', () => {
  it('keeps numbers that start with +', () => {
    expect(toInternational('+91 98765 43210', '1')).toBe('919876543210');
    expect(toInternational('+1 (212) 555-1234', '91')).toBe('12125551234');
  });

  it('treats 00 as the international prefix', () => {
    expect(toInternational('0044 7911 123456', '91')).toBe('447911123456');
  });

  it('adds the default code to local numbers', () => {
    expect(toInternational('98765 43210', '91')).toBe('919876543210');
    expect(toInternational('098765-43210', '91')).toBe('919876543210');
    expect(toInternational('07911 123456', '44')).toBe('447911123456');
    expect(toInternational('(212) 555-1234', '1')).toBe('12125551234');
  });

  it('does not double the country code', () => {
    expect(toInternational('919876543210', '91')).toBe('919876543210');
  });

  it('rejects things that are not phone numbers', () => {
    expect(toInternational('', '91')).toBeNull();
    expect(toInternational('hello', '91')).toBeNull();
    expect(toInternational('+12', '91')).toBeNull();
    expect(toInternational('+1234567890123456', '91')).toBeNull();
  });
});
