
import React from 'react';
import type { User } from '../types';
import { ViewType } from '../types';
import { PlusIcon, KanbanIcon, ListIcon, LogoutIcon, Logo, SunIcon, MoonIcon, SystemIcon } from './icons/Icons';
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

const Header: React.FC<HeaderProps> = ({ user, currentView, setView, onNewTask, onLogout }) => {
  return (
    <header className="bg-light-bg dark:bg-dark-bg sticky top-0 z-10 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <div className="flex items-center space-x-3 text-xl font-bold">
                <Logo className="h-10 w-10" />
                <span className="hidden sm:block">ProductMG</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* View Switcher */}
            <div className="p-1 rounded-xl bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center space-x-1">
                <NeumorphicButton onClick={() => setView(ViewType.Kanban)} isActive={currentView === ViewType.Kanban} aria-label="Kanban View">
                    <KanbanIcon />
                </NeumorphicButton>
                <NeumorphicButton onClick={() => setView(ViewType.List)} isActive={currentView === ViewType.List} aria-label="List View">
                    <ListIcon />
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
            <div className="flex items-center space-x-3">
              <img className="h-10 w-10 rounded-full shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm" src={user.avatarUrl} alt={user.name} />
              <span className="font-semibold hidden lg:block">{user.name}</span>
               <NeumorphicButton onClick={onLogout} aria-label="Logout" className="flex items-center">
                   <LogoutIcon />
                   <span className="ml-2 hidden sm:block">Logout</span>
               </NeumorphicButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;