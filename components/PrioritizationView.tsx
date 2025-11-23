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

type TaskWithScore = Task & { riceScore: number };

const reachScaleMapping: { [key: number]: number } = {
    1: 100,
    2: 500,
    3: 1500,
    4: 5000,
    5: 10000,
};

const calculateRiceScore = (task: Task): number => {
    const { reach = 0, impact = 0, confidence = 0, effort = 1 } = task;
    if (effort === 0) return 0; // Avoid division by zero
    const mappedReach = reachScaleMapping[reach] || 0;
    // Map confidence from 1-5 scale to a percentage multiplier (e.g. 3 -> 0.6)
    const confidenceMultiplier = (confidence * 20) / 100;
    return Math.round((mappedReach * impact * confidenceMultiplier) / effort);
}

const PrioritizationView: React.FC<PrioritizationViewProps> = ({ onEditTask, onNewTask }) => {
  const { state, dispatch } = useAppContext();
  const filteredTasks = useTaskFilters(state.tasks, state.filters);
  
  const tasksWithScores = React.useMemo(() => {
    return filteredTasks.map(task => ({
      ...task,
      riceScore: calculateRiceScore(task),
    }));
  }, [filteredTasks]);

  const { sortedData: sortedTasks, handleSort, getSortArrow } = useSort<TaskWithScore>(tasksWithScores, 'riceScore', 'desc');

  const handleTaskUpdate = React.useCallback((task: Task, field: keyof Task, value: any) => {
    // Ensure numeric fields are numbers
    const updatedValue = ['reach', 'impact', 'confidence', 'effort', 'risk'].includes(field as string)
      ? Number(value) || 0
      : value;

    const updatedTask = { ...task, [field]: updatedValue };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  }, [dispatch]);

  const getScoreColor = (score: number) => {
    if (score > 100) return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100';
    if (score > 50) return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100';
    return 'bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset';
  };

  return (
    <div className="animate-fade-in">
        <PrioritizationToolbar onNewTask={onNewTask} />
        <div className="bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="text-xs capitalize whitespace-nowrap bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-[5]">
                        <tr className="border-b border-light-shadow-2/50 dark:border-dark-shadow-1 text-light-text dark:text-dark-text">
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer min-w-[200px]" onClick={() => handleSort('title')}>Summary {getSortArrow('title')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('risk')}>Risk {getSortArrow('risk')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('reach')}>Reach {getSortArrow('reach')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('impact')}>Impact {getSortArrow('impact')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('confidence')}>Confidence {getSortArrow('confidence')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('effort')}>Effort {getSortArrow('effort')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('riceScore')}>RICE Score {getSortArrow('riceScore')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.map(task => {
                            const score = task.riceScore;
                            return (
                                <tr key={task.id} className="border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 hover:bg-light-shadow-1/20 dark:hover:bg-dark-shadow-1/20">
                                    <td scope="row" className="px-3 py-2 font-medium whitespace-nowrap">
                                        <div onClick={() => onEditTask(task)} className="cursor-pointer hover:text-brand-primary transition-colors truncate max-w-xs" title={task.title}>{task.title}</div>
                                    </td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.risk || 0} onChange={(v) => handleTaskUpdate(task, 'risk', v)} colorClass="bg-red-500 dark:bg-red-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.reach || 0} onChange={(v) => handleTaskUpdate(task, 'reach', v)} colorClass="bg-indigo-500 dark:bg-indigo-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.impact || 0} onChange={(v) => handleTaskUpdate(task, 'impact', v)} colorClass="bg-blue-500 dark:bg-blue-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.confidence || 0} onChange={(v) => handleTaskUpdate(task, 'confidence', v)} colorClass="bg-green-500 dark:bg-green-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.effort || 0} onChange={(v) => handleTaskUpdate(task, 'effort', v)} colorClass="bg-yellow-500 dark:bg-yellow-400" /></td>
                                    <td className="px-3 py-2">
                                        <div className={`px-2 py-0.5 rounded-md font-bold text-center w-12 ${getScoreColor(score)}`}>
                                            {score}
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