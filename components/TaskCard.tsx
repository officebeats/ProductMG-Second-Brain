

import * as React from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { TASK_TYPE_COLORS, TASK_PRIORITY_COLORS } from '../constants';
import { PriorityIcon, PaperclipIcon, CalendarIcon } from './icons/Icons';
import NeumorphicCheckbox from './NeumorphicCheckbox';

interface TaskCardProps {
    task: Task;
    onEditTask: (task: Task) => void;
    isCompact?: boolean;
    onTaskDragStart: () => void;
    onTaskDragEnd: () => void;
    isSelected?: boolean;
    onSelect?: (selected: boolean) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEditTask, isCompact = false, onTaskDragStart, onTaskDragEnd, isSelected = false, onSelect }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        // Don't drag if selection checkbox is clicked (handled by stopPropagation in Checkbox)
        // But also, if we are currently selecting things, maybe dragging should be disabled?
        // For now, standard drag.
        e.dataTransfer.setData('taskId', task.id);
        setTimeout(() => {
            e.currentTarget.classList.add('opacity-50', 'rotate-2', 'scale-105');
        }, 0);
        onTaskDragStart();
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-50', 'rotate-2', 'scale-105');
        onTaskDragEnd();
    };

    const formatDueDate = (dateString?: string) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const isOverdue = (task: Task) => {
        if (!task.dueDate || task.status === TaskStatus.Done) return false;
        const today = new Date();
        today.setHours(0,0,0,0);
        return new Date(task.dueDate) < today;
    };

    if (isCompact) {
        return (
             <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClick={() => onEditTask(task)}
                className={`bg-light-bg dark:bg-dark-bg p-2 rounded-lg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset cursor-pointer transition-all duration-200 flex items-center justify-between group ${isSelected ? 'ring-2 ring-brand-primary' : ''}`}
            >
                <div className="flex items-center flex-1 min-w-0">
                     {onSelect && (
                        <div className={`mr-2 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <NeumorphicCheckbox checked={isSelected} onChange={onSelect} className="w-4 h-4" />
                        </div>
                    )}
                    <h3 className="font-medium text-xs truncate" title={task.title}>{task.title}</h3>
                </div>
                {(task.attachments?.length || 0) > 0 && <PaperclipIcon className="h-3 w-3 text-light-text/50 dark:text-dark-text/50 ml-2" />}
            </div>
        )
    }

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => onEditTask(task)}
            className={`bg-light-bg dark:bg-dark-bg p-3 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset active:shadow-neumorphic-light-sm-inset dark:active:shadow-neumorphic-dark-sm-inset cursor-pointer transition-all duration-200 group relative ${isSelected ? 'ring-2 ring-brand-primary' : ''}`}
        >
            {onSelect && (
                <div className={`absolute top-2 right-2 z-10 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <NeumorphicCheckbox checked={isSelected} onChange={onSelect} />
                </div>
            )}
            
            <h3 className={`font-medium text-sm mb-2 leading-snug ${onSelect ? 'pr-6' : ''}`}>{task.title}</h3>
            <div className="flex items-center justify-between text-xs">
                 <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate max-w-[80px] ${TASK_TYPE_COLORS[task.type]}`}>
                    {task.type}
                </span>
                <div className="flex items-center space-x-2">
                    {(task.attachments?.length || 0) > 0 && 
                        <div className="flex items-center text-light-text/70 dark:text-dark-text/70">
                            <PaperclipIcon className="h-3 w-3" />
                            <span className="text-[10px] font-medium ml-0.5">{task.attachments?.length}</span>
                        </div>
                    }
                    
                    {task.dueDate && (
                         <div className={`flex items-center text-[10px] font-medium ${isOverdue(task) ? 'text-red-500 font-bold' : 'text-light-text/70 dark:text-dark-text/70'}`} title={isOverdue(task) ? 'Overdue' : 'Due Date'}>
                            <CalendarIcon className="h-3 w-3 mr-0.5" />
                            <span>{formatDueDate(task.dueDate)}</span>
                        </div>
                    )}

                    <div className={`flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>
                       <PriorityIcon priority={task.priority} />
                    </div>
                </div>
            </div>
            {task.assignee && (
                <div className="mt-2 flex items-center justify-end">
                     <img
                        className="h-5 w-5 rounded-full shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm"
                        src={task.assignee.avatarUrl}
                        alt={task.assignee.name}
                        title={task.assignee.name}
                        loading="lazy"
                    />
                </div>
            )}
        </div>
    );
};

export default TaskCard;
