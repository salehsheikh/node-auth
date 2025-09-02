"use client";
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

   
    if (pathname === '/dashboard' && user.role !== 'admin') {
      router.push('/login');
      return;
    }

    setIsChecking(false);
  }, [user, loading, pathname, router]);

  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return children;
}