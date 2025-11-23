
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import type { Task } from '../types';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useSort } from '../hooks/useSort';
import RatingDots from './RatingDots';
import PrioritizationToolbar from './PrioritizationToolbar';

interface PrioritizationViewProps {
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}

type TaskWithScore = Task & { prioritizationScore: number };

const calculatePrioritizationScore = (task: Task): number => {
    // Map internal keys to DVF + Politics:
    // reach -> Desirability (High is good)
    // impact -> Viability (High is good)
    // effort -> Feasibility (High is good - e.g., High Feasibility = Easy)
    // confidence -> Demand/Politics (High is BAD/High friction)
    
    const desirability = task.reach || 0;
    const viability = task.impact || 0;
    const feasibility = task.effort || 0;
    const demandPolitics = task.confidence || 1; // Default to 1 to avoid divide by zero

    // Formula: (Desirability * Viability * Feasibility) / Demand/Politics
    // If Politics is high (5), score drops significantly.
    
    if (demandPolitics === 0) return 0;

    // Max raw score potential: (5 * 5 * 5) / 1 = 125
    return Math.round((desirability * viability * feasibility) / demandPolitics);
}

const getTShirtSize = (score: number): string => {
    if (score >= 100) return 'XL';
    if (score >= 50) return 'L';
    if (score >= 25) return 'M';
    if (score >= 10) return 'S';
    return 'XS';
};

const getScoreColor = (score: number) => {
    if (score >= 100) return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'; // XL
    if (score >= 50) return 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'; // L
    if (score >= 25) return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'; // M
    if (score >= 10) return 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'; // S
    return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'; // XS
};

const PrioritizationView: React.FC<PrioritizationViewProps> = ({ onEditTask, onNewTask }) => {
  const { state, dispatch } = useAppContext();
  const filteredTasks = useTaskFilters(state.tasks, state.filters);
  
  const tasksWithScores = React.useMemo(() => {
    return filteredTasks.map(task => ({
      ...task,
      prioritizationScore: calculatePrioritizationScore(task),
    }));
  }, [filteredTasks]);

  const { sortedData: sortedTasks, handleSort, getSortArrow } = useSort<TaskWithScore>(tasksWithScores, 'prioritizationScore', 'desc');

  const handleTaskUpdate = React.useCallback((task: Task, field: keyof Task, value: any) => {
    const updatedValue = ['reach', 'impact', 'confidence', 'effort', 'risk'].includes(field as string)
      ? Number(value) || 0
      : value;

    const updatedTask = { ...task, [field]: updatedValue };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  }, [dispatch]);

  return (
    <div className="animate-fade-in">
        <PrioritizationToolbar onNewTask={onNewTask} />
        <div className="bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="text-xs capitalize whitespace-nowrap bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-[5]">
                        <tr className="border-b border-light-shadow-2/50 dark:border-dark-shadow-1 text-light-text dark:text-dark-text">
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer min-w-[200px]" onClick={() => handleSort('title')}>Summary {getSortArrow('title')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('risk')} title="Speed To Revenue: How fast can this generate revenue?">Speed To Revenue {getSortArrow('risk')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('reach')} title="Desirability: User demand">Desirability {getSortArrow('reach')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('impact')} title="Viability: Business value">Viability {getSortArrow('impact')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('effort')} title="Feasibility: Ease of build (High = Easy)">Feasibility {getSortArrow('effort')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('confidence')} title="Demand/Politics: Organizational friction (High = Harder collaboration)">Demand/Politics {getSortArrow('confidence')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('prioritizationScore')} title="DVF Score / Politics (T-Shirt Size)">Score {getSortArrow('prioritizationScore')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.map(task => {
                            const score = task.prioritizationScore;
                            return (
                                <tr key={task.id} className="border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 hover:bg-light-shadow-1/20 dark:hover:bg-dark-shadow-1/20">
                                    <td scope="row" className="px-3 py-2 font-medium whitespace-nowrap">
                                        <div onClick={() => onEditTask(task)} className="cursor-pointer hover:text-brand-primary transition-colors truncate max-w-xs" title={task.title}>{task.title}</div>
                                    </td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.risk || 0} onChange={(v) => handleTaskUpdate(task, 'risk', v)} colorClass="bg-red-500 dark:bg-red-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.reach || 0} onChange={(v) => handleTaskUpdate(task, 'reach', v)} colorClass="bg-indigo-500 dark:bg-indigo-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.impact || 0} onChange={(v) => handleTaskUpdate(task, 'impact', v)} colorClass="bg-blue-500 dark:bg-blue-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.effort || 0} onChange={(v) => handleTaskUpdate(task, 'effort', v)} colorClass="bg-yellow-500 dark:bg-yellow-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.confidence || 0} onChange={(v) => handleTaskUpdate(task, 'confidence', v)} colorClass="bg-orange-500 dark:bg-orange-400" /></td>
                                    <td className="px-3 py-2">
                                        <div className={`px-2 py-0.5 rounded-md font-bold text-center w-12 ${getScoreColor(score)}`}>
                                            {getTShirtSize(score)}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default PrioritizationView;
