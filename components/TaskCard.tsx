
import React from 'react';
import type { Task } from '../types';
import { TASK_TYPE_COLORS, TASK_PRIORITY_COLORS } from '../constants';
import { PriorityIcon, PaperclipIcon } from './icons/Icons';

interface TaskCardProps {
    task: Task;
    onEditTask: (task: Task) => void;
    isCompact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEditTask, isCompact = false }) => {
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('taskId', task.id);
    };

    if (isCompact) {
        return (
             <div
                draggable
                onDragStart={handleDragStart}
                onClick={() => onEditTask(task)}
                className="bg-light-bg dark:bg-dark-bg p-2 rounded-lg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset cursor-pointer transition-all duration-200 flex items-center justify-between"
            >
                <h3 className="font-semibold text-sm truncate" title={task.title}>{task.title}</h3>
                {(task.attachments?.length || 0) > 0 && <PaperclipIcon className="h-4 w-4 text-light-text/50 dark:text-dark-text/50" />}
            </div>
        )
    }

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={() => onEditTask(task)}
            className="bg-light-bg dark:bg-dark-bg p-4 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset active:shadow-neumorphic-light-sm-inset dark:active:shadow-neumorphic-dark-sm-inset cursor-pointer transition-all duration-200"
        >
            <h3 className="font-semibold mb-2">{task.title}</h3>
            <div className="flex items-center justify-between text-sm">
                 <span className={`px-2 py-1 rounded-md text-xs font-medium ${TASK_TYPE_COLORS[task.type]}`}>
                    {task.type}
                </span>
                <div className="flex items-center space-x-2">
                    {(task.attachments?.length || 0) > 0 && 
                        <div className="flex items-center text-light-text/70 dark:text-dark-text/70">
                            <PaperclipIcon className="h-4 w-4" />
                            <span className="text-xs font-medium ml-1">{task.attachments?.length}</span>
                        </div>
                    }
                    <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>
                       <PriorityIcon priority={task.priority} />
                       <span className="ml-1">{task.priority}</span>
                    </div>
                </div>
            </div>
            {task.assignee && (
                <div className="mt-3 flex items-center justify-end">
                     <img
                        className="h-6 w-6 rounded-full shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm"
                        src={task.assignee.avatarUrl}
                        alt={task.assignee.name}
                        title={task.assignee.name}
                    />
                </div>
            )}
        </div>
    );
};

export default TaskCard;