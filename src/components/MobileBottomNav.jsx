import { Archive, Home, Search, Settings, Tags } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      key: "home",
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      key: "search",
      label: "Search",
      icon: Search,
      path: "/search",
    },
    {
      key: "archived",
      label: "Archive",
      icon: Archive,
      path: "/archived",
    },
    // {
    //   key: "tags",
    //   label: "Tags",
    //   icon: Tags,
    //   path: "/tags",
    // },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ]

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
  
    return location.pathname.startsWith(path);
  }
  
  return (
    <div className='fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 shadow-2xl'>
      <div className='grid grid-cols-4 gap-1 p-2'>
        {navItems.map((item) => (
          <Button 
            key={item.key} 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(item.path)}
            className={cn(
              "group flex flex-col gap-1.5 h-14 text-xs rounded-xl relative overflow-hidden",
              "transition-all duration-300 ease-out",
              isActive(item.path) 
                ? "font-medium" 
                : "text-slate-600 hover:text-slate-900"
            )}
            style={isActive(item.path) ? {
              color: 'var(--color-primary)'
            } : {}}
          >
            {/* Active indicator background */}
            {isActive(item.path) && (
              <div 
                className="absolute inset-0 -z-10 opacity-10"
                style={{
                  background: 'var(--gradient-primary)'
                }}
              />
            )}
            
            {/* Icon with animation */}
            <div className={cn(
              "relative transition-all duration-300",
              isActive(item.path) 
                ? "scale-110" 
                : "group-hover:scale-110 group-hover:-translate-y-0.5"
            )}>
              <item.icon 
                className={cn(
                  "size-5 transition-all duration-300",
                  isActive(item.path) && "drop-shadow-sm"
                )} 
              />
              
              {/* Active dot indicator */}
              {isActive(item.path) && (
                <div 
                  className="absolute -top-1 -right-1 size-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
              )}
            </div>
            
            {/* Label */}
            <span className={cn(
              "leading-none transition-all duration-300",
              isActive(item.path) && "font-semibold"
            )}>
              {item.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}