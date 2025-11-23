
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import { TaskType, TaskPriority, TaskStatus } from '../types';
import { SearchIcon } from './icons/Icons';

const FilterBar: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { filters } = state;

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        dispatch({
            type: 'SET_FILTERS',
            payload: { [e.target.name]: e.target.value },
        });
    };

    const NeumorphicInput = "w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-200";

    return (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center animate-fade-in">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
                <input
                    type="text"
                    name="searchQuery"
                    placeholder="Search tasks..."
                    value={filters.searchQuery}
                    onChange={handleFilterChange}
                    className={`${NeumorphicInput} pl-10`}
                    aria-label="Search tasks"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-text/50 dark:text-dark-text/50">
                    <SearchIcon />
                </div>
            </div>
            
            {/* Type Filter */}
            <div>
                <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className={NeumorphicInput}
                    aria-label="Filter by type"
                >
                    <option value="All">All Types</option>
                    {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            {/* Priority Filter */}
            <div>
                 <select
                    name="priority"
                    value={filters.priority}
                    onChange={handleFilterChange}
                    className={NeumorphicInput}
                    aria-label="Filter by priority"
                >
                    <option value="All">All Priorities</option>
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Status Filter */}
             <div>
                 <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className={NeumorphicInput}
                    aria-label="Filter by status"
                >
                    <option value="All">All Statuses</option>
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

        </div>
    );
};

export default FilterBar;