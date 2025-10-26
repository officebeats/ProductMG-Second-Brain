
import React, { useState } from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';
import QuickTaskForm from './QuickTaskForm';
import { PlusIcon } from './icons/Icons';

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onEditTask: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onDrop, onDragOver, onDragLeave, onEditTask }) => {
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const isDoneColumn = status === TaskStatus.Done;

    return (
        <div
            className={`rounded-2xl p-4 transition-all duration-300 min-h-[500px] flex flex-col ${isDoneColumn ? 'bg-light-bg/60 dark:bg-dark-bg/60' : 'bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset'}`}
            onDrop={(e) => onDrop(e, status)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <h2 className={`text-lg font-semibold mb-4 flex items-center ${isDoneColumn ? 'justify-center text-center' : 'justify-between'}`}>
                <span>{status}</span>
                {!isDoneColumn && <span className="bg-light-bg dark:bg-dark-bg text-xs font-bold px-3 py-1 rounded-full shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm">{tasks.length}</span>}
            </h2>

            {status === TaskStatus.Triage && (
                <div className="mb-4">
                    {showQuickAdd ? (
                        <QuickTaskForm onClose={() => setShowQuickAdd(false)} />
                    ) : (
                        <button
                            onClick={() => setShowQuickAdd(true)}
                            className="w-full flex items-center justify-center p-2 rounded-lg border-2 border-dashed border-light-shadow-2/50 dark:border-dark-shadow-1/50 text-light-text/70 dark:text-dark-text/70 hover:bg-brand-secondary/20 hover:border-brand-primary/50 transition-colors duration-200"
                            aria-label="Add new quick task"
                        >
                            <PlusIcon />
                            <span className="ml-2 font-medium">New Quick Task</span>
                        </button>
                    )}
                </div>
            )}
            
            <div className="space-y-4 overflow-y-auto flex-grow">
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} onEditTask={onEditTask} isCompact={isDoneColumn} />
                ))}
            </div>
        </div>
    );
};

export default KanbanColumn;
