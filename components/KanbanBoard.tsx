
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import KanbanColumn from './KanbanColumn';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { isWithinCurrentWeek } from '../utils';


interface KanbanBoardProps {
    onEditTask: (task: Task) => void;
    selectedTaskIds: Set<string>;
    onSelectTask: (taskId: string, selected: boolean) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditTask, selectedTaskIds, onSelectTask }) => {
    const { state, dispatch } = useAppContext();
    const [isDraggingTask, setIsDraggingTask] = React.useState(false);

    // Use the custom hook for filtering, ignoring the status filter for Kanban view
    const filteredTasks = useTaskFilters(state.tasks, state.filters, { ignoreStatus: true });

    const tasksByStatus = React.useMemo(() => {
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


    const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            dispatch({ type: 'MOVE_TASK', payload: { taskId, newStatus: status } });
        }
    }, [dispatch]);

    const handleTaskDragStart = () => {
        setIsDraggingTask(true);
    };

    const handleTaskDragEnd = () => {
        setIsDraggingTask(false);
    };
    
    return (
        <div className="flex flex-nowrap overflow-x-auto pb-4 gap-4 h-[calc(100vh-140px)] animate-fade-in items-start">
            {KANBAN_COLUMNS.map(status => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus[status]}
                    onDrop={handleDrop}
                    onEditTask={onEditTask}
                    isDraggingTask={isDraggingTask}
                    onTaskDragStart={handleTaskDragStart}
                    onTaskDragEnd={handleTaskDragEnd}
                    selectedTaskIds={selectedTaskIds}
                    onSelectTask={onSelectTask}
                />
            ))}
            {/* Spacer to allow scrolling to see the last column comfortably */}
            <div className="w-2 flex-shrink-0" />
        </div>
    );
};

export default KanbanBoard;
