'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  staffId?: string;
  grade?: string;
  section?: string;
  department?: string;
  school?: string;
  title?: string;
  learningGoals?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (role: UserRole, phoneOrEmail?: string, customName?: string, fullProfile?: Partial<UserProfile>) => void;
  setUserSession: (profile: UserProfile, token?: string) => void;
  register: (data: Partial<UserProfile> & { role: UserRole; name: string; phone?: string; email?: string }) => void;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const DEMO_STUDENT: UserProfile = {
  id: 'st-01',
  name: 'Lingjensthaibi',
  phone: '+91 98765 43210',
  email: 'lingjensthaibi@student.learngraph.edu',
  role: 'student',
  studentId: 'ST-2026-084',
  grade: '12th Grade',
  section: 'Section A',
  school: 'Lincoln High School',
  learningGoals: 'Master differential calculus, chain rule, and definite integrals',
};

const DEMO_TEACHER: UserProfile = {
  id: 'fac-01',
  name: 'Dr. Sarah Jenkins',
  title: 'Dr.',
  phone: '+91 98123 45678',
  email: 's.jenkins@faculty.learngraph.edu',
  role: 'teacher',
  department: 'Mathematics & Computer Science',
  school: 'Lincoln High School & District 4',
  section: 'Section A, Section B',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);

  // Sync session on initial hydration
  useEffect(() => {
    let isMounted = true;

    async function syncSession() {
      // 1. Initial local storage hydration
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('learngraph_auth_user');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (isMounted) {
              setUser(parsed);
              setIsAuthenticated(true);
            }
          } catch {
            // Silently ignore invalid JSON in storage
          }
        }
      }

      // 2. Verify and synchronize active server session cookie
      try {
        const res = await fetch('/api/auth/me');

        // Handle unauthenticated/guest state gracefully without throwing errors
        if (res.status === 401 || res.status === 403) {
          if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('learngraph_auth_user');
              localStorage.removeItem('learngraph_session_token');
            }
          }
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.authenticated && data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('learngraph_auth_user', JSON.stringify(data.user));
            }
          } else if (isMounted) {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        // Silently catch network errors or offline states without logging to console
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    syncSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const setUserSession = useCallback((profile: UserProfile, token?: string) => {
    setUser(profile);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('learngraph_auth_user', JSON.stringify(profile));
      if (token) {
        localStorage.setItem('learngraph_session_token', token);
      }
    }
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('learngraph_auth_user');
      localStorage.removeItem('learngraph_demo_mode');
      localStorage.removeItem('learngraph_session_token');
    }
  }, []);

  const login = useCallback((role: UserRole, phoneOrEmail?: string, customName?: string, fullProfile?: Partial<UserProfile>) => {
    if (fullProfile && fullProfile.name) {
      const profile: UserProfile = {
        id: fullProfile.id || `${role}-${Date.now()}`,
        name: fullProfile.name,
        role: fullProfile.role || role,
        phone: fullProfile.phone || phoneOrEmail,
        email: fullProfile.email || `${phoneOrEmail || 'user'}@learngraph.edu`,
        studentId: fullProfile.studentId,
        staffId: fullProfile.staffId,
        grade: fullProfile.grade,
        section: fullProfile.section,
        department: fullProfile.department,
        school: fullProfile.school,
        title: fullProfile.title,
        learningGoals: fullProfile.learningGoals,
      };
      setUser(profile);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('learngraph_auth_user', JSON.stringify(profile));
      }
      return;
    }

    let profile: UserProfile;
    const isPhone = phoneOrEmail?.includes('+') || (phoneOrEmail && /^\d+$/.test(phoneOrEmail.replace(/[\s-]/g, '')));
    if (role === 'student') {
      profile = {
        ...DEMO_STUDENT,
        phone: isPhone ? phoneOrEmail : DEMO_STUDENT.phone,
        email: !isPhone && phoneOrEmail ? phoneOrEmail : DEMO_STUDENT.email,
        name: customName || DEMO_STUDENT.name,
      };
    } else {
      profile = {
        ...DEMO_TEACHER,
        phone: isPhone ? phoneOrEmail : DEMO_TEACHER.phone,
        email: !isPhone && phoneOrEmail ? phoneOrEmail : DEMO_TEACHER.email,
        name: customName || DEMO_TEACHER.name,
      };
    }

    setUser(profile);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('learngraph_auth_user', JSON.stringify(profile));
    }
  }, []);

  const register = useCallback((data: Partial<UserProfile> & { role: UserRole; name: string; phone?: string; email?: string }) => {
    const newUser: UserProfile = {
      id: `${data.role}-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.phone || 'user'}@learngraph.edu`,
      role: data.role,
      studentId: data.studentId || (data.role === 'student' ? `ST-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
      grade: data.grade,
      section: data.section || 'Section A',
      department: data.department,
      school: data.school || 'Lincoln High School',
      title: data.title,
      learningGoals: data.learningGoals,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('learngraph_auth_user', JSON.stringify(newUser));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error calling logout API:', e);
    }
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isReady,
        login,
        setUserSession,
        register,
        logout,
        clearSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}