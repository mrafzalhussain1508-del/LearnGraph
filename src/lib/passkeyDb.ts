/**
 * LearnGraph Passkey (WebAuthn) In-Memory Mock Database
 * Stores active cryptographic challenges and registered user passkey credentials.
 */

export interface RegisteredPasskey {
  id: string; // Base64URL string credentialID
  publicKey: Uint8Array;
  counter: number;
  transports?: string[];
  deviceType?: string;
  backedUp?: boolean;
  createdAt: string;
}

export interface UserPasskeyAccount {
  userId: string;
  username: string;
  displayName: string;
  role: 'student' | 'teacher';
  profile: Record<string, any>;
  passkeys: RegisteredPasskey[];
}

// Global in-memory storage to survive HMR in dev
declare global {
  // eslint-disable-next-line no-var
  var __learngraph_challenges: Map<string, { challenge: string; createdAt: number }> | undefined;
  // eslint-disable-next-line no-var
  var __learngraph_users: Map<string, UserPasskeyAccount> | undefined;
}

const challengesMap = globalThis.__learngraph_challenges ?? new Map<string, { challenge: string; createdAt: number }>();
const usersMap = globalThis.__learngraph_users ?? new Map<string, UserPasskeyAccount>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__learngraph_challenges = challengesMap;
  globalThis.__learngraph_users = usersMap;
}

export const passkeyDb = {
  /**
   * Stores challenge for 5 minutes during registration/authentication
   */
  saveChallenge(userId: string, challenge: string): void {
    challengesMap.set(userId, { challenge, createdAt: Date.now() });
  },

  /**
   * Retrieves active challenge
   */
  getChallenge(userId: string): string | undefined {
    const item = challengesMap.get(userId);
    if (!item) return undefined;
    // 5 minutes TTL
    if (Date.now() - item.createdAt > 5 * 60 * 1000) {
      challengesMap.delete(userId);
      return undefined;
    }
    return item.challenge;
  },

  /**
   * Cleans up challenge once verified
   */
  deleteChallenge(userId: string): void {
    challengesMap.delete(userId);
  },

  /**
   * Saves or appends a passkey device to user account
   */
  saveUserCredential(
    userId: string,
    passkey: RegisteredPasskey,
    accountInfo: {
      username: string;
      displayName: string;
      role: 'student' | 'teacher';
      profile?: Record<string, any>;
    }
  ): void {
    const existing = usersMap.get(userId);
    if (existing) {
      // Avoid duplicate credentials
      const filtered = existing.passkeys.filter((p) => p.id !== passkey.id);
      filtered.push(passkey);
      existing.passkeys = filtered;
      if (accountInfo.profile) {
        existing.profile = { ...existing.profile, ...accountInfo.profile };
      }
      usersMap.set(userId, existing);
    } else {
      usersMap.set(userId, {
        userId,
        username: accountInfo.username,
        displayName: accountInfo.displayName,
        role: accountInfo.role,
        profile: accountInfo.profile || {},
        passkeys: [passkey],
      });
    }
  },

  /**
   * Fetches user by userId
   */
  getUser(userId: string): UserPasskeyAccount | undefined {
    return usersMap.get(userId);
  },

  /**
   * Lists all users with passkeys
   */
  getAllUsers(): UserPasskeyAccount[] {
    return Array.from(usersMap.values());
  },
};
