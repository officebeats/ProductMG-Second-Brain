
import React, { useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import KanbanColumn from './KanbanColumn';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { KANBAN_COLUMNS } from '../constants';

interface KanbanBoardProps {
    onEditTask: (task: Task) => void;
}

const isWithinCurrentWeek = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sunday as the first day of the week
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());

    // Saturday as the last day of the week
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);
    
    return date >= firstDayOfWeek && date <= lastDayOfWeek;
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditTask }) => {
    const { state, dispatch } = useAppContext();

    const filteredTasks = useMemo(() => {
        const { searchQuery, type, priority, status } = state.filters;
        const query = searchQuery.toLowerCase();

        return state.tasks.filter(task => {
            const matchesSearch = query ? (
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            ) : true;

            const matchesType = type !== 'All' ? task.type === type : true;
            const matchesPriority = priority !== 'All' ? task.priority === priority : true;
            // For Kanban, we ignore the status filter in the main filtering, as columns represent status.
            // It will be used if the user selects a status, but the primary view is all statuses.
            const matchesStatus = status !== 'All' ? task.status === status : true;

            return matchesSearch && matchesType && matchesPriority && matchesStatus;
        });
    }, [state.tasks, state.filters]);

    const tasksByStatus = useMemo(() => {
        const columns: Record<TaskStatus, Task[]> = {
            [TaskStatus.Triage]: [],
            [TaskStatus.Today]: [],
            [TaskStatus.Next]: [],
            [TaskStatus.Backlog]: [],
            [TaskStatus.Done]: [],
        };

        for (const task of filteredTasks) {
            // Dates from <input type="date"> are like YYYY-MM-DD.
            // new Date() parses this as UTC midnight.
            // To compare with local time, we adjust by parsing as local time.
            const dueDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00') : null;
            
            if (task.status === TaskStatus.Done) {
                columns[TaskStatus.Done].push(task);
                continue;
            }

            if (dueDate && isWithinCurrentWeek(dueDate)) {
                columns[TaskStatus.Today].push(task);
                continue; 
            }
            
            if (task.status in columns) {
                columns[task.status].push(task);
            }
        }
        return columns;
    }, [filteredTasks]);


    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus: status } });
        }
        e.currentTarget.classList.remove('bg-brand-primary/10');
    }, [dispatch]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-brand-primary/10');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-brand-primary/10');
    };
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr,1fr,1fr,1fr,0.7fr] gap-6 animate-fade-in">
            {KANBAN_COLUMNS.map(status => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onEditTask={onEditTask}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;