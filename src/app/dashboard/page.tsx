'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (user.role === 'teacher') {
      router.replace('/teacher');
    } else {
      router.replace('/student');
    }
  }, [user, isReady, isAuthenticated, router]);

  return null;
}
