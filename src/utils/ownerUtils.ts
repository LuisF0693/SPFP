/**
 * Owner Display Utilities
 *
 * Utilities for displaying account/card owner names properly
 * replacing "ME" with user's actual name and "SPOUSE" with spouse's name.
 */

import { AccountOwner, UserProfile } from '../types';

interface UserInfo {
  email?: string;
}

/**
 * Get display name for an account owner
 * @param owner - The owner type ('ME' | 'SPOUSE' | 'JOINT')
 * @param userProfile - User profile with name and spouse info
 * @param user - Optional user object with email fallback
 * @returns Human-readable owner name
 */
export function getOwnerDisplayName(
  owner: AccountOwner,
  userProfile?: Partial<UserProfile> | null,
  user?: UserInfo | null
): string {
  switch (owner) {
    case 'ME':
      // Try profile name first, then email username, then fallback
      if (userProfile?.name) return userProfile.name;
      if (user?.email) return user.email.split('@')[0];
      return 'Eu';

    case 'SPOUSE':
      // Use spouse name from profile or fallback
      if (userProfile?.spouseName) return userProfile.spouseName;
      return 'Cônjuge';

    case 'JOINT':
      return 'Conjunto';

    default:
      return owner;
  }
}

/**
 * Get card display name with owner
 * @param cardName - The card/account name
 * @param owner - The owner type
 * @param userProfile - User profile
 * @param user - Optional user info
 * @returns Formatted string like "Nubank - João"
 */
export function getCardDisplayName(
  cardName: string,
  owner: AccountOwner,
  userProfile?: Partial<UserProfile> | null,
  user?: UserInfo | null
): string {
  const ownerName = getOwnerDisplayName(owner, userProfile, user);
  return `${cardName} - ${ownerName}`;
}

/**
 * Get cardholder name for credit card display
 * Based on account owner, returns proper cardholder name
 * @param owner - Account owner
 * @param userProfile - User profile
 * @param user - Optional user info
 * @returns Cardholder name in UPPERCASE for credit card display
 */
export function getCardHolderName(
  owner: AccountOwner,
  userProfile?: Partial<UserProfile> | null,
  user?: UserInfo | null
): string {
  const name = getOwnerDisplayName(owner, userProfile, user);
  return name.toUpperCase();
}
