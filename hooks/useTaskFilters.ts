import * as React from 'react';
import type { Task, TaskType, TaskPriority, TaskStatus } from '../types';

interface Filters {
    searchQuery: string;
    type: TaskType | 'All';
    priority: TaskPriority | 'All';
    status: TaskStatus | 'All';
}

interface Options {
    ignoreStatus?: boolean;
}

/**
 * A custom hook to filter tasks based on the provided filter criteria.
 * @param tasks - The array of tasks to filter.
 * @param filters - An object containing the filter values.
 * @param options - Optional configuration to modify filtering behavior.
 * @returns A memoized array of filtered tasks.
 */
export const useTaskFilters = (tasks: Task[], filters: Filters, options: Options = {}): Task[] => {
    return React.useMemo(() => {
        const { searchQuery, type, priority, status } = filters;
        const query = searchQuery.toLowerCase();
        const { ignoreStatus = false } = options;

        return tasks.filter(task => {
            const matchesSearch = query ? (
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query)
            ) : true;

            const matchesType = type !== 'All' ? task.type === type : true;
            const matchesPriority = priority !== 'All' ? task.priority === priority : true;
            const matchesStatus = ignoreStatus || status === 'All' ? true : task.status === status;

            return matchesSearch && matchesType && matchesPriority && matchesStatus;
        });
    }, [tasks, filters, options]);
};
