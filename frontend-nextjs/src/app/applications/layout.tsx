import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/layout/Navbar';

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Navbar />
      <div className="navbar-content-offset sidebar-transition min-h-screen pb-20 lg:pb-0">
        {children}
      </div>
    </AuthGuard>
  );
}
