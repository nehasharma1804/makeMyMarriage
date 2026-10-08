import type { PublicUser } from '@mmm/contracts';

export interface PasswordAccount {
  name: string;
  email: string;
  passwordHash: string;
}

export interface PasswordCredentials {
  user: StoredUser;
  passwordHash: string | null;
}

export interface StoredUser extends PublicUser {
  status: 'ACTIVE' | 'DISABLED';
}

export interface StoredSession {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export interface LoginChallenge {
  tokenHash: string;
  csrfHash: string;
  expiresAt: Date;
}
