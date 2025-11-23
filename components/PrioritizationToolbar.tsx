
import * as React from 'react';
import { PlusIcon, MagicIcon } from './icons/Icons';

interface PrioritizationToolbarProps {
    onNewTask: () => void;
    onToggleWeights: () => void;
    showWeights: boolean;
}

const PrioritizationToolbar: React.FC<PrioritizationToolbarProps> = ({ onNewTask, onToggleWeights, showWeights }) => {
    return (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={onNewTask}
                    className="flex items-center justify-center bg-brand-primary text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:opacity-90 transition-all duration-200"
                >
                    <PlusIcon />
                    <span className="ml-2">Create an idea</span>
                </button>
                
                <button
                    onClick={onToggleWeights}
                    className={`flex items-center justify-center px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${showWeights ? 'bg-brand-secondary/20 text-brand-primary shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset' : 'bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset'}`}
                >
                    <MagicIcon className="h-4 w-4 mr-2"/>
                    Configure Weights
                </button>
            </div>
        </div>
    );
}

export default PrioritizationToolbar;
