import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Task } from '../types';
import { TASK_TYPE_COLORS, TASK_PRIORITY_COLORS } from '../constants';

interface ListViewProps {
    onEditTask: (task: Task) => void;
}

type SortKey = keyof Task;
type SortDirection = 'asc' | 'desc';

const ListView: React.FC<ListViewProps> = ({ onEditTask }) => {
    const { state } = useAppContext();
    const [sortKey, setSortKey] = useState<SortKey>('createdAt');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
            const matchesStatus = status !== 'All' ? task.status === status : true;

            return matchesSearch && matchesType && matchesPriority && matchesStatus;
        });
    }, [state.tasks, state.filters]);

    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];

            if (valA === undefined || valB === undefined) return 0;

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredTasks, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

    const renderSortArrow = (key: SortKey) => {
        if (sortKey !== key) return null;
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    return (
        <div className="animate-fade-in">
            {/* Desktop View: Table */}
            <div className="hidden md:block bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase">
                            <tr className="border-b border-light-shadow-2/50 dark:border-dark-shadow-1 text-light-text dark:text-dark-text">
                                <th scope="col" className="px-6 py-8 font-semibold cursor-pointer" onClick={() => handleSort('title')}>Title {renderSortArrow('title')}</th>
                                <th scope="col" className="px-6 py-8 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Status {renderSortArrow('status')}</th>
                                <th scope="col" className="px-6 py-8 font-semibold cursor-pointer" onClick={() => handleSort('type')}>Type {renderSortArrow('type')}</th>
                                <th scope="col" className="px-6 py-8 font-semibold cursor-pointer" onClick={() => handleSort('priority')}>Priority {renderSortArrow('priority')}</th>
                                <th scope="col" className="px-6 py-8 font-semibold cursor-pointer" onClick={() => handleSort('createdAt')}>Created {renderSortArrow('createdAt')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTasks.map(task => (
                                <tr key={task.id} className="border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 hover:bg-light-shadow-1/20 dark:hover:bg-dark-shadow-1/20 cursor-pointer" onClick={() => onEditTask(task)}>
                                    <th scope="row" className="px-6 py-8 font-medium whitespace-nowrap">{task.title}</th>
                                    <td className="px-6 py-8">{task.status}</td>
                                    <td className="px-6 py-8">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</span>
                                    </td>
                                    <td className="px-6 py-8">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                                    </td>
                                    <td className="px-6 py-8">{formatDate(task.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-4">
                {sortedTasks.map(task => (
                    <div key={task.id} onClick={() => onEditTask(task)} className="bg-light-bg dark:bg-dark-bg p-4 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm active:shadow-neumorphic-light-sm-inset dark:active:shadow-neumorphic-dark-sm-inset">
                        <h3 className="font-bold mb-2">{task.title}</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                                <p className="font-semibold text-xs opacity-70">Status</p>
                                <p>{task.status}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-xs opacity-70">Priority</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                            </div>
                            <div>
                                <p className="font-semibold text-xs opacity-70">Type</p>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</span>
                            </div>
                            <div>
                                <p className="font-semibold text-xs opacity-70">Created</p>
                                <p>{formatDate(task.createdAt)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListView;