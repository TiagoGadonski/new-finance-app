import { Navbar } from '@/components/layout/Navbar';
import { ReactNode } from 'react';

export default function Template({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="pb-8">{children}</main>
    </div>
  );
}
