
import * as React from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import TaskCard from './TaskCard';
import QuickTaskForm from './QuickTaskForm';
import { PlusIcon } from './icons/Icons';

interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => void;
    onEditTask: (task: Task) => void;
    isDraggingTask: boolean;
    onTaskDragStart: () => void;
    onTaskDragEnd: () => void;
    selectedTaskIds: Set<string>;
    onSelectTask: (taskId: string, selected: boolean) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onDrop, onEditTask, isDraggingTask, onTaskDragStart, onTaskDragEnd, selectedTaskIds, onSelectTask }) => {
    const [showQuickAdd, setShowQuickAdd] = React.useState(false);
    const isDoneColumn = status === TaskStatus.Done;

    const dropZoneStyle = isDraggingTask && !isDoneColumn ? 'border-2 border-dashed border-brand-primary/50' : '';

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDoneColumn) {
            e.preventDefault();
            e.currentTarget.classList.add('scale-[1.02]', 'bg-brand-secondary/20', 'dark:bg-dark-shadow-1');
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('scale-[1.02]', 'bg-brand-secondary/20', 'dark:bg-dark-shadow-1');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isDoneColumn) {
            onDrop(e, status);
        }
        handleDragLeave(e); // Clean up styles regardless
    };

    return (
        <div
            className={`flex-none w-72 rounded-2xl p-3 transition-all duration-300 max-h-full flex flex-col ${isDoneColumn ? 'bg-light-bg/60 dark:bg-dark-bg/60' : 'bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset'} ${dropZoneStyle}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <h2 className={`text-base font-bold mb-3 flex items-center ${isDoneColumn ? 'justify-center text-center' : 'justify-between'}`}>
                <span className="truncate">{status}</span>
                {!isDoneColumn && <span className="bg-light-bg dark:bg-dark-bg text-[10px] font-bold px-2 py-0.5 rounded-full shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm">{tasks.length}</span>}
            </h2>

            {status === TaskStatus.Triage && (
                <div className="mb-3">
                    {showQuickAdd ? (
                        <QuickTaskForm onClose={() => setShowQuickAdd(false)} />
                    ) : (
                        <button
                            onClick={() => setShowQuickAdd(true)}
                            className="w-full flex items-center justify-center p-1.5 rounded-lg border-2 border-dashed border-light-shadow-2/50 dark:border-dark-shadow-1/50 text-light-text/70 dark:text-dark-text/70 hover:bg-brand-secondary/20 hover:border-brand-primary/50 transition-colors duration-200"
                            aria-label="Add new quick task"
                        >
                            <PlusIcon />
                            <span className="ml-1 text-xs font-medium">Quick Task</span>
                        </button>
                    )}
                </div>
            )}
            
            <div className="space-y-3 overflow-y-auto flex-grow pr-1 custom-scrollbar">
                {tasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onEditTask={onEditTask} 
                        isCompact={isDoneColumn} 
                        onTaskDragStart={onTaskDragStart}
                        onTaskDragEnd={onTaskDragEnd}
                        isSelected={selectedTaskIds.has(task.id)}
                        onSelect={(selected) => onSelectTask(task.id, selected)}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanColumn;
