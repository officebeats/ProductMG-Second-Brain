
import * as React from 'react';
import type { User } from '../types';
import { ViewType } from '../types';
import { PlusIcon, KanbanIcon, ListIcon, LogoutIcon, Logo, SunIcon, MoonIcon, SystemIcon, StakeholderIcon, ChartBarIcon } from './icons/Icons';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  user: User;
  currentView: ViewType;
  setView: (view: ViewType) => void;
  onNewTask: () => void;
  onLogout: () => void;
}

const NeumorphicButton: React.FC<{onClick?: () => void, children: React.ReactNode, className?: string, 'aria-label'?: string, isActive?: boolean}> = ({ onClick, children, className, 'aria-label': ariaLabel, isActive }) => {
    const activeClasses = 'shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset text-brand-primary';
    const inactiveClasses = 'shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset';
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-xl transition-all duration-200 ${isActive ? activeClasses : inactiveClasses} ${className}`}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
};

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="p-1 rounded-xl bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center space-x-1">
            <NeumorphicButton onClick={() => setTheme('light')} isActive={theme === 'light'} aria-label="Light mode">
                <SunIcon />
            </NeumorphicButton>
            <NeumorphicButton onClick={() => setTheme('dark')} isActive={theme === 'dark'} aria-label="Dark mode">
                <MoonIcon />
            </NeumorphicButton>
            <NeumorphicButton onClick={() => setTheme('system')} isActive={theme === 'system'} aria-label="System theme">
                <SystemIcon />
            </NeumorphicButton>
        </div>
    );
}

const UserMenu: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={menuRef} className="relative">
            <button 
                onClick={() => setIsOpen(prev => !prev)} 
                className="flex items-center p-1 rounded-full shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset transition-all duration-200"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} loading="lazy" />
            </button>
            
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-56 bg-light-bg dark:bg-dark-bg rounded-xl shadow-neumorphic-light dark:shadow-neumorphic-dark z-20 p-2 animate-fade-in" 
                    style={{animationDuration: '150ms'}}
                    role="menu"
                >
                    <div className="px-2 py-2 mb-1 border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                        <p className="font-bold text-sm" role="menuitem">{user.name}</p>
                        <p className="text-xs text-light-text/70 dark:text-dark-text/70 truncate" role="menuitem">{user.email}</p>
                    </div>
                    <button onClick={onLogout} className="w-full text-left flex items-center px-2 py-2 text-sm rounded-md hover:bg-brand-secondary/20 transition-colors" role="menuitem">
                        <LogoutIcon />
                        <span className="ml-2 font-semibold">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ user, currentView, setView, onNewTask, onLogout }) => {
  return (
    <header className="bg-light-bg dark:bg-dark-bg sticky top-0 z-10 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <div className="flex items-center space-x-3 text-2xl font-bold">
                <Logo className="h-12 w-12" />
                <span className="hidden sm:block">
                    <span className="text-light-text dark:text-white">Product</span>
                    <span className="text-brand-primary ml-1">MG</span>
                </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* View Switcher */}
            <div className="p-1 rounded-xl bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center space-x-1">
                <NeumorphicButton onClick={() => setView(ViewType.Kanban)} isActive={currentView === ViewType.Kanban} aria-label="Kanban View" className="flex items-center px-3">
                    <KanbanIcon />
                    <span className="ml-2 hidden md:inline">Kanban</span>
                </NeumorphicButton>
                <NeumorphicButton onClick={() => setView(ViewType.List)} isActive={currentView === ViewType.List} aria-label="List View" className="flex items-center px-3">
                    <ListIcon />
                    <span className="ml-2 hidden md:inline">List</span>
                </NeumorphicButton>
                 <NeumorphicButton onClick={() => setView(ViewType.Prioritization)} isActive={currentView === ViewType.Prioritization} aria-label="Prioritization View" className="flex items-center px-3">
                    <ChartBarIcon />
                    <span className="ml-2 hidden md:inline">Prioritization</span>
                </NeumorphicButton>
                <NeumorphicButton onClick={() => setView(ViewType.Stakeholders)} isActive={currentView === ViewType.Stakeholders} aria-label="Stakeholders View" className="flex items-center px-3">
                    <StakeholderIcon />
                    <span className="ml-2 hidden md:inline">Stakeholders</span>
                </NeumorphicButton>
            </div>

            <button
              onClick={onNewTask}
              className="flex items-center justify-center bg-brand-primary text-white px-3 sm:px-4 py-2 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all duration-200"
            >
              <PlusIcon />
              <span className="ml-2 hidden sm:block">New Task</span>
            </button>
            <ThemeToggle />
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
