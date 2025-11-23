
import * as React from 'react';
import { TaskStatus, TaskPriority, TaskType } from '../types';
import { TrashIcon, CloseIcon } from './icons/Icons';

interface BulkActionToolbarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onUpdateStatus: (status: TaskStatus) => void;
    onUpdatePriority: (priority: TaskPriority) => void;
    onDelete: () => void;
}

const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ selectedCount, onClearSelection, onUpdateStatus, onUpdatePriority, onDelete }) => {
    if (selectedCount === 0) return null;

    const NeumorphicSelect = "p-2 text-sm rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none cursor-pointer transition-all text-light-text dark:text-dark-text font-medium";

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-light-bg/90 dark:bg-dark-bg/90 backdrop-blur-md p-3 rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark flex items-center gap-4 border border-light-shadow-2/20 dark:border-dark-shadow-1/20">
                
                <div className="flex items-center pl-2 border-r border-light-shadow-2/30 dark:border-dark-shadow-2/50 pr-4">
                    <span className="font-bold text-brand-primary text-lg mr-2">{selectedCount}</span>
                    <span className="text-sm font-medium opacity-70">Selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <select 
                        className={NeumorphicSelect}
                        onChange={(e) => { if(e.target.value) onUpdateStatus(e.target.value as TaskStatus); }}
                        value=""
                    >
                        <option value="" disabled>Set Status</option>
                        {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select 
                        className={NeumorphicSelect}
                        onChange={(e) => { if(e.target.value) onUpdatePriority(e.target.value as TaskPriority); }}
                        value=""
                    >
                        <option value="" disabled>Set Priority</option>
                        {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    
                    <div className="w-px h-8 bg-light-shadow-2/30 dark:bg-dark-shadow-2/50 mx-1"></div>

                    <button 
                        onClick={onDelete}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete Selected"
                    >
                        <TrashIcon />
                    </button>
                </div>

                <button 
                    onClick={onClearSelection}
                    className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Clear Selection"
                >
                    <CloseIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default BulkActionToolbar;
