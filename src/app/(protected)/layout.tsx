import DashboardSidebar from '@/components/layout/DashboardSidebar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar />
      <main className="lg:pl-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
