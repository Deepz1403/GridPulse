import  { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from "@/assets/images/image.png";
import { 
  LayoutDashboard, 
  FileInput,
  Zap,
  Users,
  Bell, 
  Menu, 
  X,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Data Entry",
    href: "/data-entry",
    icon: FileInput,
  },
  {
    title: "Substation Entry",
    href: "/substation-entry",
    icon: Zap,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Assign Employees",
    href: "/assign-employee",
    icon: Users,
  },
  {
    title: "Chatbot",
    href: "/chatbot",
    icon: MessageSquare,
  }
];

export function MainNav({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Handle resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar collapse state (only for desktop)
  const toggleCollapse = () => {
    if (window.innerWidth >= 768) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <>
      {/* Mobile navigation trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 right-4 z-50 hover:bg-[#343230] text-[#F5FBFE]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile navigation overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Collapse toggle button (desktop only) */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex fixed top-4 left-4 z-50 hover:bg-[#343230]/70 text-[#F5FBFE] rounded-full w-8 h-8"
        onClick={toggleCollapse}
      >
        <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
      </Button>

      {/* Sidebar navigation */}
      <div className={cn(
        "grid-pulse-glass fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-r-[#EBEBEB]/10 transition-all duration-300 ease-in-out bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        collapsed ? "md:w-20" : "md:w-72",
        "w-72",
        className
      )}>
        {/* Logo section */}
        <div className={`flex items-center justify-center py-6 ${collapsed ? 'px-2' : 'px-6'} border-b border-[#EBEBEB]/10`}>
          {collapsed ? (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 flex items-center justify-center overflow-hidden">
              <img src={logo} className="w-10 h-10 object-contain" alt="Grid Pulse" />
            </div>
          ) : (
            <img src={logo} className="w-[180px] h-[120px] object-contain" alt="Grid Pulse" />
          )}
        </div>

        {/* Navigation links */}
        <nav className={`flex-1 overflow-y-auto py-6 ${collapsed ? 'px-2' : 'px-4'} scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent`}>
          <div className="space-y-1.5">
            {items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 text-white" 
                      : "hover:bg-[#343230]/50 text-gray-300 hover:text-white",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={cn(
                    "flex items-center justify-center relative",
                    isActive && "text-[#4B9BFF]"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-all",
                      isActive ? "text-[#5EC9ED]" : "text-gray-400 group-hover:text-[#5EC9ED]",
                    )} />
                    
                    {isActive && (
                      <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-1 h-5 bg-[#5EC9ED] rounded-r-full" />
                    )}
                  </div>
                  
                  {!collapsed && (
                    <span className={cn(
                      "ml-3 transition-colors duration-200",
                      isActive ? "text-white font-semibold" : "text-gray-300 group-hover:text-white"
                    )}>
                      {item.title}
                    </span>
                  )}
                  
                  {collapsed && (
                    <span className="absolute left-full ml-2 rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer section */}
        <div className={`mt-auto border-t border-t-[#EBEBEB]/10 py-4 ${collapsed ? 'px-2' : 'px-4'}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "w-full text-gray-300 hover:bg-[#343230]/50 hover:text-white transition-all duration-200 rounded-lg",
              collapsed ? "justify-center px-2" : "justify-start px-3"
            )}
          >
            <div className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
            
            {!collapsed && <span className="ml-3">Notifications</span>}
            
            {collapsed && (
              <span className="absolute left-full ml-2 rounded bg-gray-800 px-2 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Notifications
              </span>
            )}
          </Button>
          
          {!collapsed && (
            <div className="mt-4 px-3 py-3 rounded-lg bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-800/30">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                  GP
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Grid Pulse</p>
                  <p className="text-xs text-gray-400">Data updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
