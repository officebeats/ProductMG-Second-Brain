
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import type { Task, ScoringWeights } from '../types';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useSort } from '../hooks/useSort';
import RatingDots from './RatingDots';
import PrioritizationToolbar from './PrioritizationToolbar';

interface PrioritizationViewProps {
  onEditTask: (task: Task) => void;
  onNewTask: () => void;
}

type TaskWithScore = Task & { prioritizationScore: number };

const calculateWeightedScore = (task: Task, weights: ScoringWeights): number => {
    // Weighted Sum Model (Normalized to 100)
    
    // 1. Positive Factors (Higher is better):
    // - Desirability (Reach)
    // - Viability (Impact)
    // - Speed To Growth (Growth)
    // - Speed To Revenue (Risk)
    
    const scoreReach = (task.reach || 1) * weights.reach;
    const scoreImpact = (task.impact || 1) * weights.impact;
    const scoreGrowth = (task.growth || 1) * weights.growth;
    const scoreRevenue = (task.risk || 1) * weights.risk; // Note: 'risk' field maps to Speed to Revenue

    // 2. Negative Factors (Lower is better, so we invert them for the score):
    // - Feasibility (Effort): High Effort = Low Score. Invert: (6 - Effort).
    // - Internal Demand (Confidence): High Friction = Low Score. Invert: (6 - Confidence).
    
    const valEffort = 6 - (task.effort || 1);
    const scoreFeasibility = valEffort * weights.effort;

    const valDemand = 6 - (task.confidence || 1);
    const scoreDemand = valDemand * weights.confidence; // Note: 'confidence' field maps to Internal Demand

    // Calculate total points achieved
    const totalPoints = scoreReach + scoreImpact + scoreGrowth + scoreRevenue + scoreFeasibility + scoreDemand;

    // Calculate maximum possible points to normalize
    // Max value for any category is 5.
    const maxPoints = (5 * weights.reach) + (5 * weights.impact) + (5 * weights.growth) + (5 * weights.risk) + (5 * weights.effort) + (5 * weights.confidence);

    if (maxPoints === 0) return 0;

    return Math.round((totalPoints / maxPoints) * 100);
}

const getTShirtSize = (score: number): string => {
    if (score >= 80) return 'XL';
    if (score >= 60) return 'L';
    if (score >= 40) return 'M';
    if (score >= 20) return 'S';
    return 'XS';
};

const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'; // XL
    if (score >= 60) return 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'; // L
    if (score >= 40) return 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'; // M
    if (score >= 20) return 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'; // S
    return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'; // XS
};

const WeightSlider: React.FC<{ label: string, value: number, onChange: (val: number) => void, description: string }> = ({ label, value, onChange, description }) => (
    <div className="flex flex-col p-3 bg-light-bg dark:bg-dark-bg rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm">
        <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-xs uppercase">{label}</span>
            <span className="text-xs font-bold text-brand-primary bg-brand-secondary/10 px-2 py-0.5 rounded">{value}x</span>
        </div>
        <p className="text-[10px] opacity-60 mb-2 h-6 leading-tight">{description}</p>
        <input 
            type="range" 
            min="0" 
            max="3" 
            step="0.5"
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
        />
        <div className="flex justify-between mt-1 text-[9px] opacity-50">
            <span>Ignore</span>
            <span>Normal</span>
            <span>Critical</span>
        </div>
    </div>
);

const PrioritizationView: React.FC<PrioritizationViewProps> = ({ onEditTask, onNewTask }) => {
  const { state, dispatch } = useAppContext();
  const [showWeights, setShowWeights] = React.useState(false);
  
  // Use a ref to prevent recalculating sorts excessively if not needed, 
  // but here we want reactive updates to weights
  const filteredTasks = useTaskFilters(state.tasks, state.filters);
  
  const tasksWithScores = React.useMemo(() => {
    return filteredTasks.map(task => ({
      ...task,
      prioritizationScore: calculateWeightedScore(task, state.weights),
    }));
  }, [filteredTasks, state.weights]);

  const { sortedData: sortedTasks, handleSort, getSortArrow } = useSort<TaskWithScore>(tasksWithScores, 'prioritizationScore', 'desc');

  const handleTaskUpdate = React.useCallback((task: Task, field: keyof Task, value: any) => {
    const updatedValue = ['reach', 'impact', 'confidence', 'effort', 'risk', 'growth'].includes(field as string)
      ? Number(value) || 0
      : value;

    const updatedTask = { ...task, [field]: updatedValue };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
  }, [dispatch]);

  const handleWeightChange = (field: keyof ScoringWeights, value: number) => {
      dispatch({ type: 'UPDATE_WEIGHTS', payload: { [field]: value } });
  }

  return (
    <div className="animate-fade-in">
        <PrioritizationToolbar onNewTask={onNewTask} onToggleWeights={() => setShowWeights(!showWeights)} showWeights={showWeights} />
        
        {showWeights && (
            <div className="mb-6 p-4 rounded-2xl bg-light-bg dark:bg-dark-shadow-2 border border-brand-primary/20 animate-fade-in">
                <h3 className="text-sm font-bold mb-3 text-brand-primary">Prioritization Weights (Business Strategy)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                     <WeightSlider 
                        label="Viability" 
                        value={state.weights.impact} 
                        onChange={(v) => handleWeightChange('impact', v)}
                        description="Business Value. How much money or strategic value does this create?"
                    />
                     <WeightSlider 
                        label="Revenue Speed" 
                        value={state.weights.risk} 
                        onChange={(v) => handleWeightChange('risk', v)}
                        description="Time to Revenue. How fast does this impact the bottom line?"
                    />
                     <WeightSlider 
                        label="Desirability" 
                        value={state.weights.reach} 
                        onChange={(v) => handleWeightChange('reach', v)}
                        description="User Reach. How many users want or need this?"
                    />
                     <WeightSlider 
                        label="Growth" 
                        value={state.weights.growth} 
                        onChange={(v) => handleWeightChange('growth', v)}
                        description="Viral loops & user acquisition speed."
                    />
                     <WeightSlider 
                        label="Feasibility" 
                        value={state.weights.effort} 
                        onChange={(v) => handleWeightChange('effort', v)}
                        description="Ease of Build. Higher weight favors easier tasks."
                    />
                     <WeightSlider 
                        label="Int. Demand" 
                        value={state.weights.confidence} 
                        onChange={(v) => handleWeightChange('confidence', v)}
                        description="Organizational Friction. Higher weight penalizes political friction."
                    />
                </div>
            </div>
        )}

        <div className="bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead className="text-xs capitalize whitespace-nowrap bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-[5]">
                        <tr className="border-b border-light-shadow-2/50 dark:border-dark-shadow-1 text-light-text dark:text-dark-text">
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer min-w-[200px]" onClick={() => handleSort('title')}>Summary {getSortArrow('title')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('impact')} title="Viability: Business Value. How much value does this create? (1 = Low, 5 = High)">Viability {getSortArrow('impact')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('risk')} title="Speed To Revenue: How quickly will this generate revenue? (1 = Slow, 5 = Fast)">Speed To Revenue {getSortArrow('risk')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('reach')} title="Desirability: User Appeal. How many customers need or want this feature? (1 = Low, 5 = High)">Desirability {getSortArrow('reach')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('growth')} title="Speed To Growth: Viral Potential. How much will this drive user acquisition? (1 = Low, 5 = High)">Speed To Growth {getSortArrow('growth')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('effort')} title="Complexity: How difficult is this to build? (1 = Easy, 5 = Hard)">Effort {getSortArrow('effort')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('confidence')} title="Internal Demand: Internal Pressure/Friction. (1 = Low, 5 = High)">Internal Demand {getSortArrow('confidence')}</th>
                            <th scope="col" className="px-3 py-3 font-semibold cursor-pointer" onClick={() => handleSort('prioritizationScore')} title="Calculated Priority">Priority {getSortArrow('prioritizationScore')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTasks.map(task => {
                            const score = task.prioritizationScore;
                            return (
                                <tr key={task.id} className="border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 hover:bg-light-shadow-1/20 dark:hover:bg-dark-shadow-1/20 transition-colors duration-150">
                                    <td scope="row" className="px-3 py-2 font-medium whitespace-nowrap">
                                        <div onClick={() => onEditTask(task)} className="cursor-pointer hover:text-brand-primary transition-colors truncate max-w-xs" title={task.title}>{task.title}</div>
                                    </td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.impact || 0} onChange={(v) => handleTaskUpdate(task, 'impact', v)} colorClass="bg-blue-500 dark:bg-blue-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.risk || 0} onChange={(v) => handleTaskUpdate(task, 'risk', v)} colorClass="bg-red-500 dark:bg-red-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.reach || 0} onChange={(v) => handleTaskUpdate(task, 'reach', v)} colorClass="bg-indigo-500 dark:bg-indigo-400" /></td>
                                    <td className="px-3 py-2"><RatingDots size="sm" value={task.growth || 0} onChange={(v) => handleTaskUpdate(task, 'growth', v)} colorClass="bg-teal-500 dark:bg-teal-400" /></td>
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
