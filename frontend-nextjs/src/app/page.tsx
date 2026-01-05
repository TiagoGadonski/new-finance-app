'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = authApi.getToken();
    const user = authApi.getUser();

    if (token && user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  );
}
