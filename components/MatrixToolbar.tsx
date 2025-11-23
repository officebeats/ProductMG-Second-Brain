import * as React from 'react';
import { PlusIcon, SearchIcon } from './icons/Icons';

interface MatrixToolbarProps {
    onNewTask: () => void;
}

const ToolbarButton: React.FC<{children: React.ReactNode, disabled?: boolean}> = ({ children, disabled }) => (
    <button 
        className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
    >
        {children}
    </button>
);


const MatrixToolbar: React.FC<MatrixToolbarProps> = ({ onNewTask }) => {
    return (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={onNewTask}
                    className="flex items-center justify-center bg-brand-primary text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all duration-200"
                >
                    Create an idea
                </button>
                <ToolbarButton>Filters +</ToolbarButton>
                <ToolbarButton>Sort +</ToolbarButton>
                <ToolbarButton disabled={true}>Fields +</ToolbarButton>
            </div>
            <div className="relative w-full sm:w-auto">
                <input
                    type="text"
                    placeholder="Find an idea in this view"
                    className="w-full sm:w-64 p-2 pl-9 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-text/50 dark:text-dark-text/50">
                    <SearchIcon />
                </div>
            </div>
        </div>
    );
}

export default MatrixToolbar;
