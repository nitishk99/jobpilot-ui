import { describe, expect, it } from '@jest/globals';
import { routes } from '../../src/config/routes';

describe('centralized routes', () => {
  it('builds encoded application detail routes', () => {
    expect(routes.application('application/one')).toBe('/applications/application%2Fone');
  });

  it('keeps core navigation paths stable', () => {
    expect(routes.login).toBe('/login');
    expect(routes.applications).toBe('/applications');
    expect(routes.review).toBe('/review');
    expect(routes.account).toBe('/account');
  });
});
