
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import { TASK_TYPE_COLORS, TASK_PRIORITY_COLORS } from '../constants';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useSort } from '../hooks/useSort';
import NeumorphicCheckbox from './NeumorphicCheckbox';
import { CalendarIcon } from './icons/Icons';

interface ListViewProps {
    onEditTask: (task: Task) => void;
    selectedTaskIds: Set<string>;
    onSelectTask: (taskId: string, selected: boolean) => void;
    onSelectAll: (taskIds: string[], selected: boolean) => void;
}

const ListView: React.FC<ListViewProps> = ({ onEditTask, selectedTaskIds, onSelectTask, onSelectAll }) => {
    const { state } = useAppContext();
    const filteredTasks = useTaskFilters(state.tasks, state.filters);
    const { sortedData: sortedTasks, handleSort, getSortArrow } = useSort<Task>(filteredTasks, 'createdAt', 'desc');
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
    const formatDueDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const isOverdue = (task: Task) => {
        if (!task.dueDate || task.status === TaskStatus.Done) return false;
        return new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
    };


    const allSelected = sortedTasks.length > 0 && sortedTasks.every(task => selectedTaskIds.has(task.id));
    const indeterminate = sortedTasks.some(task => selectedTaskIds.has(task.id)) && !allSelected;

    return (
        <div className="animate-fade-in">
            {/* Desktop View: Table */}
            <div className="hidden md:block bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase">
                            <tr className="border-b border-light-shadow-2/50 dark:border-dark-shadow-1 text-light-text dark:text-dark-text">
                                <th scope="col" className="px-4 py-3 w-12">
                                    <NeumorphicCheckbox 
                                        checked={allSelected} 
                                        onChange={(checked) => onSelectAll(sortedTasks.map(t => t.id), checked)}
                                    />
                                </th>
                                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer" onClick={() => handleSort('title')}>Title {getSortArrow('title')}</th>
                                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Status {getSortArrow('status')}</th>
                                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer" onClick={() => handleSort('type')}>Type {getSortArrow('type')}</th>
                                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer" onClick={() => handleSort('priority')}>Priority {getSortArrow('priority')}</th>
                                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer" onClick={() => handleSort('dueDate')}>Due Date {getSortArrow('dueDate')}</th>
                                <th scope="col" className="px-4 py-3 font-semibold cursor-pointer" onClick={() => handleSort('createdAt')}>Created Date {getSortArrow('createdAt')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTasks.map(task => (
                                <tr 
                                    key={task.id} 
                                    className={`border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 hover:bg-light-shadow-1/20 dark:hover:bg-dark-shadow-1/20 cursor-pointer transition-colors ${selectedTaskIds.has(task.id) ? 'bg-brand-secondary/10' : ''}`} 
                                    onClick={() => onEditTask(task)}
                                >
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <NeumorphicCheckbox 
                                            checked={selectedTaskIds.has(task.id)} 
                                            onChange={(checked) => onSelectTask(task.id, checked)} 
                                        />
                                    </td>
                                    <th scope="row" className="px-4 py-3 font-medium whitespace-nowrap truncate max-w-xs" title={task.title}>{task.title}</th>
                                    <td className="px-4 py-3">{task.status}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap ${isOverdue(task) ? 'text-red-500 font-semibold' : ''}`}>
                                        {formatDueDate(task.dueDate)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(task.createdAt)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View: Cards */}
            <div className="block md:hidden space-y-3">
                <div className="flex items-center justify-end mb-2 px-1">
                    <button 
                        onClick={() => onSelectAll(sortedTasks.map(t => t.id), !allSelected)}
                        className="text-xs font-bold text-brand-primary"
                    >
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                {sortedTasks.map(task => (
                    <div key={task.id} onClick={() => onEditTask(task)} className={`bg-light-bg dark:bg-dark-bg p-3 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm relative ${selectedTaskIds.has(task.id) ? 'ring-2 ring-brand-primary' : ''}`}>
                        <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                             <NeumorphicCheckbox 
                                checked={selectedTaskIds.has(task.id)} 
                                onChange={(checked) => onSelectTask(task.id, checked)} 
                            />
                        </div>
                        <h3 className="font-bold mb-1 text-sm pr-8">{task.title}</h3>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            <div>
                                <p className="font-semibold opacity-70">Status</p>
                                <p>{task.status}</p>
                            </div>
                            <div>
                                <p className="font-semibold opacity-70">Priority</p>
                                <span className={`px-1.5 py-0.5 rounded-full font-semibold ${TASK_PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                            </div>
                            <div>
                                <p className="font-semibold opacity-70">Type</p>
                                <span className={`px-1.5 py-0.5 rounded-md font-medium ${TASK_TYPE_COLORS[task.type]}`}>{task.type}</span>
                            </div>
                            <div>
                                <p className="font-semibold opacity-70">Due Date</p>
                                <div className={`flex items-center ${isOverdue(task) ? 'text-red-500 font-bold' : ''}`}>
                                    <CalendarIcon className="w-3 h-3 mr-1"/>
                                    {formatDueDate(task.dueDate)}
                                </div>
                            </div>
                             <div>
                                <p className="font-semibold opacity-70">Created Date</p>
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
