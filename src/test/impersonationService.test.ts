import { describe, it, expect, beforeEach } from 'vitest';
import { impersonationService, IMPERSONATION_KEY, IMPERSONATED_USER_ID_KEY } from '../services/impersonationService';

describe('impersonationService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('isActive()', () => {
    it('returns false when no impersonation is stored', () => {
      expect(impersonationService.isActive()).toBe(false);
    });

    it('returns true when localStorage has isImpersonating = "true"', () => {
      localStorage.setItem(IMPERSONATION_KEY, 'true');
      expect(impersonationService.isActive()).toBe(true);
    });

    it('returns false when localStorage has isImpersonating = "false"', () => {
      localStorage.setItem(IMPERSONATION_KEY, 'false');
      expect(impersonationService.isActive()).toBe(false);
    });

    it('returns false for any value other than "true"', () => {
      localStorage.setItem(IMPERSONATION_KEY, '1');
      expect(impersonationService.isActive()).toBe(false);
    });
  });

  describe('getTargetUserId()', () => {
    it('returns null when no userId is stored', () => {
      expect(impersonationService.getTargetUserId()).toBeNull();
    });

    it('returns the stored userId', () => {
      localStorage.setItem(IMPERSONATED_USER_ID_KEY, 'user-abc-123');
      expect(impersonationService.getTargetUserId()).toBe('user-abc-123');
    });

    it('returns null after the key is cleared', () => {
      localStorage.setItem(IMPERSONATED_USER_ID_KEY, 'some-user');
      localStorage.removeItem(IMPERSONATED_USER_ID_KEY);
      expect(impersonationService.getTargetUserId()).toBeNull();
    });
  });

  describe('persist(userId)', () => {
    it('sets isImpersonating key to "true"', () => {
      impersonationService.persist('target-user');
      expect(localStorage.getItem(IMPERSONATION_KEY)).toBe('true');
    });

    it('stores the target userId', () => {
      impersonationService.persist('target-user-456');
      expect(localStorage.getItem(IMPERSONATED_USER_ID_KEY)).toBe('target-user-456');
    });

    it('isActive() returns true after persist()', () => {
      impersonationService.persist('some-user');
      expect(impersonationService.isActive()).toBe(true);
    });

    it('getTargetUserId() returns userId after persist()', () => {
      impersonationService.persist('my-client');
      expect(impersonationService.getTargetUserId()).toBe('my-client');
    });

    it('overwrites previous userId when called again', () => {
      impersonationService.persist('first-user');
      impersonationService.persist('second-user');
      expect(impersonationService.getTargetUserId()).toBe('second-user');
    });
  });

  describe('clear()', () => {
    it('removes the impersonation key from localStorage', () => {
      impersonationService.persist('user-to-clear');
      impersonationService.clear();
      expect(localStorage.getItem(IMPERSONATION_KEY)).toBeNull();
    });

    it('removes the userId key from localStorage', () => {
      impersonationService.persist('user-to-clear');
      impersonationService.clear();
      expect(localStorage.getItem(IMPERSONATED_USER_ID_KEY)).toBeNull();
    });

    it('isActive() returns false after clear()', () => {
      impersonationService.persist('some-user');
      impersonationService.clear();
      expect(impersonationService.isActive()).toBe(false);
    });

    it('getTargetUserId() returns null after clear()', () => {
      impersonationService.persist('some-user');
      impersonationService.clear();
      expect(impersonationService.getTargetUserId()).toBeNull();
    });

    it('is safe to call when nothing is stored (no-op)', () => {
      expect(() => impersonationService.clear()).not.toThrow();
    });
  });

  describe('persist → clear → persist cycle', () => {
    it('works correctly across multiple cycles', () => {
      impersonationService.persist('client-A');
      expect(impersonationService.isActive()).toBe(true);
      expect(impersonationService.getTargetUserId()).toBe('client-A');

      impersonationService.clear();
      expect(impersonationService.isActive()).toBe(false);
      expect(impersonationService.getTargetUserId()).toBeNull();

      impersonationService.persist('client-B');
      expect(impersonationService.isActive()).toBe(true);
      expect(impersonationService.getTargetUserId()).toBe('client-B');
    });
  });

  describe('exported constants', () => {
    it('IMPERSONATION_KEY is the correct key name', () => {
      expect(IMPERSONATION_KEY).toBe('spfp_is_impersonating');
    });

    it('IMPERSONATED_USER_ID_KEY is the correct key name', () => {
      expect(IMPERSONATED_USER_ID_KEY).toBe('spfp_impersonated_user_id');
    });
  });
});
