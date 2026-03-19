import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MapPin, Camera, Bell, LayoutDashboard } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  highlight?: boolean;
}

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { unreadCount } = useNotifications();

  const navItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MapPin, label: 'Mileage', path: '/mileage-tracker' },
    { icon: Camera, label: 'Scan', path: '/scan-receipt', highlight: true },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
    { icon: LayoutDashboard, label: 'My Reports', path: '/driver-dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-h-[56px] min-w-[56px] px-3 py-2 rounded-lg transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                active && !item.highlight && "text-primary bg-primary/10",
                !active && !item.highlight && "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                item.highlight && [
                  "relative -mt-4",
                  active 
                    ? "text-white bg-primary shadow-lg" 
                    : "text-white bg-secondary hover:bg-secondary/90 shadow-lg"
                ]
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {item.highlight ? (
                <div className="bg-gradient-to-br from-primary to-secondary rounded-full p-3 shadow-xl">
                  <Icon className="h-7 w-7 text-white" />
                </div>
              ) : (
                <div className="relative">
                  <Icon className={cn("h-6 w-6", active && "scale-110")} />
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
              <span className={cn(
                "text-xs mt-1 font-medium",
                item.highlight && "text-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
