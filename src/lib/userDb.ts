import fs from 'fs';
import path from 'path';

export interface RegisteredUser {
  id: string;
  role: 'student' | 'teacher';
  name: string;
  username?: string;
  phone: string;
  email: string;
  password?: string;
  studentId?: string;
  staffId?: string;
  grade?: string;
  section?: string;
  department?: string;
  school?: string;
  title?: string;
  learningGoals?: string;
  createdAt: string;
}

const SEED_USERS: RegisteredUser[] = [
  {
    id: 'st-01',
    role: 'student',
    name: 'Alex Chen',
    phone: '+91 98765 43210',
    email: 'alex.chen@student.learngraph.edu',
    password: 'password123',
    studentId: 'ST-2026-084',
    grade: '10th Grade',
    section: 'Section A',
    school: 'Lincoln High School',
    learningGoals: 'Master graph transformations and radical functions',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'fac-01',
    role: 'teacher',
    name: 'Dr. Sarah Jenkins',
    title: 'Dr.',
    phone: '+91 98123 45678',
    email: 's.jenkins@faculty.learngraph.edu',
    password: 'password123',
    staffId: 'FAC-2026-904',
    department: 'Mathematics & Computer Science',
    school: 'Lincoln High School & District 4',
    section: 'Section A, Section B',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __learngraph_user_db: Map<string, RegisteredUser> | undefined;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'registered_users.json');

function loadPersistedUsers(): RegisteredUser[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading persisted users:', err);
  }
  return [];
}

function persistUsers(users: RegisteredUser[]): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

function initUserMap(): Map<string, RegisteredUser> {
  const map = new Map<string, RegisteredUser>();

  // Add seed users first
  for (const user of SEED_USERS) {
    map.set(user.id, user);
  }

  // Add persisted users
  const persisted = loadPersistedUsers();
  for (const user of persisted) {
    map.set(user.id, user);
  }

  return map;
}

const userMap: Map<string, RegisteredUser> =
  globalThis.__learngraph_user_db ?? initUserMap();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__learngraph_user_db = userMap;
}

export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[\s\-\(\)\+]/g, '').replace(/^91/, '');
}

export const userDb = {
  findUserByIdentifier(identifier: string, role?: 'student' | 'teacher'): RegisteredUser | undefined {
    if (!identifier) return undefined;
    const cleanId = identifier.trim();
    const cleanLower = cleanId.toLowerCase();
    const cleanNormPhone = normalizePhone(cleanId);

    // If role is provided, restrict candidate pool strictly to that role
    const candidates = Array.from(userMap.values()).filter(
      (user) => !role || user.role === role
    );

    for (const user of candidates) {
      // 1. Exact Email match (highest fidelity)
      if (user.email && user.email.toLowerCase() === cleanLower) {
        return user;
      }
      // 2. Exact Username match
      if (user.username && user.username.toLowerCase() === cleanLower) {
        return user;
      }
      // 3. Email username prefix match (e.g. "alex.chen" from "alex.chen@student.learngraph.edu")
      if (user.email && user.email.split('@')[0].toLowerCase() === cleanLower) {
        return user;
      }
      // 4. Role-specific ID match
      if (role === 'student' && user.studentId && user.studentId.toLowerCase() === cleanLower) {
        return user;
      }
      if (role === 'teacher' && user.staffId && user.staffId.toLowerCase() === cleanLower) {
        return user;
      }
      if (!role) {
        if (user.studentId && user.studentId.toLowerCase() === cleanLower) return user;
        if (user.staffId && user.staffId.toLowerCase() === cleanLower) return user;
      }
      // 5. Exact Name match (case-insensitive)
      if (user.name && user.name.toLowerCase() === cleanLower) {
        return user;
      }
      // 6. Phone match (normalized digits)
      if (cleanNormPhone && normalizePhone(user.phone) === cleanNormPhone) {
        return user;
      }
      // 7. Internal User ID match
      if (user.id && user.id.toLowerCase() === cleanLower) {
        return user;
      }
      // 8. Normalized Name or Username match (e.g. "alex_chen" matches "Alex Chen" or "alex.chen")
      const strippedClean = cleanLower.replace(/[\s\-_.]/g, '');
      if (strippedClean.length >= 3) {
        if (user.name && user.name.toLowerCase().replace(/[\s\-_.]/g, '') === strippedClean) {
          return user;
        }
        if (user.username && user.username.toLowerCase().replace(/[\s\-_.]/g, '') === strippedClean) {
          return user;
        }
        if (user.email && user.email.split('@')[0].toLowerCase().replace(/[\s\-_.]/g, '') === strippedClean) {
          return user;
        }
      }
    }

    return undefined;
  },

  createUser(userData: Partial<RegisteredUser> & { role: 'student' | 'teacher'; name: string }): RegisteredUser {
    const cleanRole: 'student' | 'teacher' = userData.role === 'teacher' ? 'teacher' : 'student';
    const cleanName = (userData.name || 'User').trim();
    const cleanEmail = userData.email?.trim().toLowerCase();
    const cleanUsername = userData.username?.trim().toLowerCase() || cleanEmail?.split('@')[0] || cleanName.toLowerCase().replace(/\s+/g, '_');
    const userId = userData.id || `${cleanRole}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser: RegisteredUser = {
      id: userId,
      role: cleanRole,
      name: cleanName,
      username: cleanUsername,
      phone: userData.phone || '',
      email: cleanEmail || `${cleanUsername}@${cleanRole === 'student' ? 'student.learngraph.edu' : 'faculty.learngraph.edu'}`,
      password: userData.password || 'password123',
      studentId: cleanRole === 'student' ? (userData.studentId || `ST-${Date.now().toString().slice(-6)}`) : undefined,
      staffId: cleanRole === 'teacher' ? (userData.staffId || `FAC-${Date.now().toString().slice(-6)}`) : undefined,
      grade: cleanRole === 'student' ? (userData.grade || '10th Grade') : undefined,
      section: userData.section || 'Section A',
      department: cleanRole === 'teacher' ? (userData.department || 'Mathematics') : undefined,
      school: userData.school || 'Lincoln High School',
      title: cleanRole === 'teacher' ? (userData.title || 'Dr.') : undefined,
      learningGoals: cleanRole === 'student' ? (userData.learningGoals || 'Algebra & Functions') : undefined,
      createdAt: userData.createdAt || new Date().toISOString(),
    };

    // STRICT: Only match existing user within the EXACT same role to prevent cross-role overwrite
    const existing = (cleanEmail ? this.findUserByIdentifier(cleanEmail, cleanRole) : undefined) ||
                     (cleanUsername ? this.findUserByIdentifier(cleanUsername, cleanRole) : undefined);

    if (existing) {
      const merged: RegisteredUser = {
        ...existing,
        ...newUser,
        id: existing.id,
        role: cleanRole, // Ensure role is NEVER corrupted or overwritten to the opposite role
      };
      userMap.set(existing.id, merged);
      persistUsers(Array.from(userMap.values()));
      return merged;
    }

    userMap.set(userId, newUser);
    persistUsers(Array.from(userMap.values()));
    return newUser;
  },

  verifyCredentials(identifier: string, password: string, role: 'student' | 'teacher'): {
    success: boolean;
    error?: string;
    user?: RegisteredUser;
  } {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter your Email Address or Username.' };
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Please enter your Secret Code / Password.' };
    }

    const cleanRole: 'student' | 'teacher' = role === 'teacher' ? 'teacher' : 'student';

    // Step 1: Strictly lookup user within the requested role portal
    const user = this.findUserByIdentifier(identifier, cleanRole);

    if (user) {
      // User found in the requested portal: verify password
      const expectedPassword = user.password || 'password123';
      if (password !== expectedPassword) {
        return { 
          success: false, 
          error: 'Incorrect Secret Code / Password. Please verify your credentials and try again.' 
        };
      }
      return { success: true, user };
    }

    // Step 2: User not found in this role. Check if the credential belongs to the opposite role
    const oppositeRole: 'student' | 'teacher' = cleanRole === 'student' ? 'teacher' : 'student';
    const oppositeUser = this.findUserByIdentifier(identifier, oppositeRole);

    if (oppositeUser) {
      const oppositeRoleTitle = oppositeRole === 'student' ? 'Student' : 'Faculty / Teacher';
      const targetPortal = oppositeRole === 'student' ? 'Student Portal' : 'Teacher / Faculty';
      return {
        success: false,
        error: `This credential belongs to a ${oppositeRoleTitle} account. Please switch to the ${targetPortal} tab above to sign in.`,
      };
    }

    // Step 3: No account found in either role
    return { 
      success: false, 
      error: `No ${cleanRole === 'student' ? 'student' : 'faculty'} account found matching "${identifier.trim()}". Please check your input or register first.` 
    };
  },

  getAllUsers(): RegisteredUser[] {
    return Array.from(userMap.values());
  },

  getStudents(): RegisteredUser[] {
    return Array.from(userMap.values())
      .filter((user) => user.role === 'student')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getStudentById(id: string): RegisteredUser | undefined {
    const user = userMap.get(id);
    return user && user.role === 'student' ? user : undefined;
  },
};
