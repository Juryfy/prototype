import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      {/* Main content — offset by sidebar width on desktop */}
      <main className="md:ml-60 min-h-screen p-4 md:p-8 pt-16 md:pt-8 max-w-[1600px]">
        <Outlet />
      </main>
    </div>
  );
}
