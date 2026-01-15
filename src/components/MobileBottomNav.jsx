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
      label: "Archived",
      icon: Archive,
      path: "/archived",
    },
    {
      key: "tags",
      label: "Tags",
      icon: Tags,
      path: "/tags",
    },
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
    <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200'>
      <div className='grid grid-cols-5 gap-1 p-2'>
        {navItems.map((item) => (
          <Button 
            key={item.key} 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(item.path)}
            className={cn(
            "group flex flex-col gap-1 h-12 text-xs rounded-md",
            "transition-all duration-200 ease-out",
            "hover:bg-blue-50 hover:text-blue-600",
            isActive(item.path) ? "bg-blue-100 text-blue-700" : "text-gray-600")}
          >
            <item.icon className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span className="leading-none">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
