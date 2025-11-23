import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import type { Task } from '../types';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useSort } from '../hooks/useSort';
import RatingDots from './RatingDots';
import MatrixToolbar from './MatrixToolbar';

interface MatrixViewProps {
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}

const MatrixView: React.FC<MatrixViewProps> = ({ onEditTask, onNewTask }) => {
  const { state, dispatch } = useAppContext();
  const filteredTasks = useTaskFilters(state.tasks, state.filters);
  const { sortedData: sortedTasks, handleSort, getSortArrow } = useSort<Task>(filteredTasks, 'createdAt', 'desc');

  const handleTaskUpdate = React.useCallback((task: Task, field: keyof Task, value: any) => {
    // Ensure numeric fields are numbers
    const updatedValue = ['reach', 'impact', 'confidence', 'effort', 'risk'].includes(field as string)
      ? Number(value) || 0
      : value;

    const updatedTask = { ...task, [field]: updatedValue };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  }, [dispatch]);

  const calculateRiceScore = (task: Task): number => {
    const { reach = 0, impact = 0, confidence = 0, effort = 1 } = task;
    if (effort === 0) return 0; // Avoid division by zero
    // Map confidence from 1-5 scale to a percentage multiplier (e.g. 3 -> 0.6)
    const confidenceMultiplier = (confidence * 20) / 100;
    return Math.round((reach * impact * confidenceMultiplier) / effort);
  }

  const getScoreColor = (score: number) => {
    if (score > 100) return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200';
    if (score > 50) return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200';
    return 'bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset';
  };

  return (
    <div className="animate-fade-in">
        <MatrixToolbar onNewTask={onNewTask} />
        <div className="bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase whitespace-nowrap">
                        <tr className="border-b border-light-shadow-2/50 dark:border-dark-shadow-1 text-light-text dark:text-dark-text">
                            <th scope="col" className="px-4 py-6 font-semibold cursor-pointer min-w-[250px]" onClick={() => handleSort('title')}>Summary {getSortArrow('title')}</th>
                            <th scope="col" className="px-4 py-6 font-semibold cursor-pointer" onClick={() => handleSort('risk')}>Risk {getSortArrow('risk')}</th>
                            <th scope="col" className="px-4 py-6 font-semibold cursor-pointer" onClick={() => handleSort('reach')}>Reach {getSortArrow('reach')}</th>
                            <th scope="col" className="px-4 py-6 font-semibold cursor-pointer" onClick={() => handleSort('impact')}>Impact {getSortArrow('impact')}</th>
                            <th scope="col" className="px-4 py-6 font-semibold cursor-pointer" onClick={() => handleSort('confidence')}>Confidence {getSortArrow('confidence')}</th>
                            <th scope="col" className="px-4 py-6 font-semibold cursor-pointer" onClick={() => handleSort('effort')}>Effort {getSortArrow('effort')}</th>
                            <th scope="col" className="px-4 py-6 font-semibold cursor-pointer">RICE Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.map(task => {
                            const score = calculateRiceScore(task);
                            return (
                                <tr key={task.id} className="border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 hover:bg-light-shadow-1/20 dark:hover:bg-dark-shadow-1/20">
                                    <td scope="row" className="px-4 py-5 font-medium whitespace-nowrap">
                                        <div onClick={() => onEditTask(task)} className="cursor-pointer hover:text-brand-primary transition-colors">{task.title}</div>
                                    </td>
                                    <td className="px-4 py-5"><RatingDots value={task.risk || 0} onChange={(v) => handleTaskUpdate(task, 'risk', v)} colorClass="text-red-500 dark:text-red-400" /></td>
                                    <td className="px-4 py-5">
                                        <input 
                                            type="number" 
                                            value={task.reach || ''} 
                                            onChange={(e) => handleTaskUpdate(task, 'reach', e.target.value)} 
                                            className="w-20 p-1.5 rounded-md bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                        />
                                    </td>
                                    <td className="px-4 py-5"><RatingDots value={task.impact || 0} onChange={(v) => handleTaskUpdate(task, 'impact', v)} colorClass="text-blue-500 dark:text-blue-400" /></td>
                                    <td className="px-4 py-5"><RatingDots value={task.confidence || 0} onChange={(v) => handleTaskUpdate(task, 'confidence', v)} colorClass="text-green-500 dark:text-green-400" /></td>
                                    <td className="px-4 py-5"><RatingDots value={task.effort || 0} onChange={(v) => handleTaskUpdate(task, 'effort', v)} colorClass="text-yellow-500 dark:text-yellow-400" /></td>
                                    <td className="px-4 py-5">
                                        <div className={`px-3 py-1.5 rounded-md font-bold text-center ${getScoreColor(score)}`}>
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

export default MatrixView;
