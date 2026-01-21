import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import MobileBottomNav from '../MobileBottomNav';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case "1":
            e.preventDefault();
            navigate("/");
            break;
          case "2":
            e.preventDefault();
            navigate("/archived");
            break;
          case "3":
            e.preventDefault();
            navigate("/search");
            break;
          case "4":
            e.preventDefault();
            navigate("/settings");
            break;
          case "n":
            e.preventDefault();
            navigate("/new");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Mobile Layout
  if (isMobile) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50'>
        {/* Mobile Header with Menu Button */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="gap-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="size-5" />
              <span className="font-semibold">Menu</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div 
                className="size-8 rounded-lg flex items-center justify-center shadow-md"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 4px 12px -2px var(--shadow-primary)'
                }}
              >
                <svg className="size-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span 
                className="text-lg font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to right, var(--color-primary-light), var(--color-primary))'
                }}
              >
                Notes.io
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          setIsMobileOpen={setIsMobileSidebarOpen} 
        />

        {/* Main Content */}
        <main className='pb-20'>
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </div>
    );
  }
  
  // Desktop/Tablet Layout
  return (
    <div className='flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50'>
      <Sidebar />
      <main className='flex-1 min-w-0 overflow-hidden'>
        {children}
      </main>
    </div>
  )
}