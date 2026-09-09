import { apiClient } from './apiClient';
import { User, AuthSession, UserRole } from '../types/auth';

// Authorized demo operator roster — works with or without live backend
const PRESET_USERS: Record<UserRole, User> = {
  fleet_manager: {
    id: 'usr-1',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@transitops.internal',
    role: 'fleet_manager',
    department: 'Fleet & Asset Operations',
  },
  dispatcher: {
    id: 'usr-2',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@transitops.internal',
    role: 'dispatcher',
    department: 'Logistics Control Center',
  },
  safety_officer: {
    id: 'usr-3',
    name: 'Captain Raymond Holt',
    email: 'raymond.holt@transitops.internal',
    role: 'safety_officer',
    department: 'Compliance & Safety Directorate',
  },
  financial_analyst: {
    id: 'usr-4',
    name: 'Siddharth Nair',
    email: 'siddharth.n@transitops.internal',
    role: 'financial_analyst',
    department: 'Capital & Operating Financial Analytics',
  },
};

// Email → role mapping for client-side resolution
const EMAIL_ROLE_MAP: Record<string, UserRole> = {
  'eleanor.vance@transitops.internal': 'fleet_manager',
  'carlos.mendez@transitops.internal': 'dispatcher',
  'raymond.holt@transitops.internal': 'safety_officer',
  'siddharth.n@transitops.internal': 'financial_analyst',
};

// Accepted demo passwords — any of these unlock any registered operator account
const VALID_DEMO_PASSWORDS = ['password123', 'admin123', 'TransitOps2026!'];

function resolveRoleFromEmail(email: string): UserRole {
  return EMAIL_ROLE_MAP[email.toLowerCase()] ?? 'fleet_manager';
}

function buildFallbackSession(email: string, role: UserRole): AuthSession {
  const user = PRESET_USERS[role] ?? {
    id: 'usr-custom',
    name: email.split('@')[0],
    email,
    role,
    department: 'Operations',
  };
  return {
    token: `demo_jwt_${Date.now()}_${user.role}`,
    expiresAt: Date.now() + 86400000,
    user,
  };
}

export const authService = {
  async login(email: string, password?: string, requestedRole?: UserRole): Promise<AuthSession> {
    const role = requestedRole ?? resolveRoleFromEmail(email);

    // 1. Attempt live backend first
    try {
      const result = await apiClient.post<AuthSession>('/auth/login', { email, password });
      apiClient.setAuthToken(result.token);
      return result;
    } catch (err: any) {
      // 2. If backend is unreachable/offline, use client-side fallback
      if (err.isNetworkFailure || err.status === 404 || err.status === 503 || err.status === 502) {
        const isValidDemoPassword = !password || VALID_DEMO_PASSWORDS.includes(password);
        const isKnownEmail = EMAIL_ROLE_MAP[email.toLowerCase()] !== undefined;

        if (isValidDemoPassword || isKnownEmail) {
          const session = buildFallbackSession(email, role);
          apiClient.setAuthToken(session.token);
          return session;
        }
      }

      // 3. If backend returned 401, try client-side validation as last resort
      if (err.status === 401) {
        const isValidDemoPassword = VALID_DEMO_PASSWORDS.includes(password ?? '');
        if (isValidDemoPassword) {
          const session = buildFallbackSession(email, role);
          apiClient.setAuthToken(session.token);
          return session;
        }
      }

      throw new Error('Invalid email or password. Use password123 with a valid operator email.');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = apiClient.getAuthToken();
    if (!token) return null;

    try {
      return await apiClient.get<User>('/auth/me');
    } catch (err: any) {
      if (err.isNetworkFailure || err.status === 404 || err.status === 401) {
        // Recover role from demo token pattern: demo_jwt_<timestamp>_<role>
        const match = token.match(/demo_jwt_\d+_([a-z_]+)$/);
        const role = (match?.[1] as UserRole) ?? 'fleet_manager';
        return PRESET_USERS[role] ?? PRESET_USERS.fleet_manager;
      }
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore — always clear token
    } finally {
      apiClient.setAuthToken(null);
    }
  },

  getPresetUser(role: UserRole): User {
    return PRESET_USERS[role];
  },
};
