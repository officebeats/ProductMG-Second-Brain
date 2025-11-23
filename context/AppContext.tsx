
import * as React from 'react';
import type { Task, Comment, Stakeholder } from '../types';
import { TaskStatus, TaskType, TaskPriority } from '../types';
import { INITIAL_TASKS } from '../constants';

interface AppState {
  tasks: Task[];
  filters: {
    searchQuery: string;
    type: TaskType | 'All';
    priority: TaskPriority | 'All';
    status: TaskStatus | 'All';
    stakeholder: string | 'All';
  };
}

type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string } // id
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStatus: TaskStatus } }
  | { type: 'SET_FILTERS', payload: Partial<AppState['filters']> }
  | { type: 'ADD_COMMENT', payload: { taskId: string; comment: Comment } }
  | { type: 'UPDATE_STAKEHOLDER', payload: { originalName: string; updatedStakeholder: Omit<Stakeholder, 'id'> } }
  | { type: 'ADD_STAKEHOLDER'; payload: Stakeholder }
  | { type: 'TRANSFER_STAKEHOLDER'; payload: { fromName: string; toName: string } }
  | { type: 'INVITE_STAKEHOLDERS'; payload: string[] } // array of stakeholder names
  | { type: 'BULK_UPDATE_TASKS'; payload: { ids: string[]; updates: Partial<Task> } }
  | { type: 'BULK_DELETE_TASKS'; payload: string[] };


const initialState: AppState = {
  tasks: INITIAL_TASKS,
  filters: {
    searchQuery: '',
    type: 'All',
    priority: 'All',
    status: 'All',
    stakeholder: 'All',
  },
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, status: action.payload.newStatus }
            : task
        ),
      };
    case 'SET_FILTERS':
        return {
            ...state,
            filters: { ...state.filters, ...action.payload },
        };
    case 'ADD_COMMENT':
        return {
            ...state,
            tasks: state.tasks.map((task) =>
                task.id === action.payload.taskId
                    ? { ...task, comments: [...(task.comments || []), action.payload.comment] }
                    : task
            ),
        };
    case 'UPDATE_STAKEHOLDER':
        return {
            ...state,
            tasks: state.tasks.map(task => {
                const mapStakeholders = (stakeholders: Stakeholder[] | undefined) =>
                    stakeholders?.map(sh =>
                        sh.name === action.payload.originalName
                            ? { ...sh, ...action.payload.updatedStakeholder }
                            : sh
                    );
                
                const mapFeatureRequests = (featureRequests: (import('../types').FeatureRequestEntry)[] | undefined) =>
                    featureRequests?.map(fr => 
                        fr.requestorName === action.payload.originalName
                            ? { ...fr, requestorName: action.payload.updatedStakeholder.name, requestorRole: action.payload.updatedStakeholder.role }
                            : fr
                    );

                return {
                    ...task,
                    stakeholders: mapStakeholders(task.stakeholders),
                    featureRequests: mapFeatureRequests(task.featureRequests),
                };
            }),
        };
    case 'ADD_STAKEHOLDER':
        const newStakeholderTask: Task = {
            id: `task-sh-${action.payload.id}`,
            title: `Stakeholder: ${action.payload.name}`,
            description: `Stakeholder record for ${action.payload.name}`,
            type: TaskType.Stakeholder,
            status: TaskStatus.Triage,
            priority: TaskPriority.Medium,
            createdAt: new Date().toISOString(),
            stakeholders: [action.payload],
        };
        return {
            ...state,
            tasks: [newStakeholderTask, ...state.tasks],
        };
    case 'TRANSFER_STAKEHOLDER':
        const { fromName, toName } = action.payload;
        return {
            ...state,
            tasks: state.tasks.map(task => {
                let updatedStakeholders = task.stakeholders;
                let updatedFeatureRequests = task.featureRequests;

                // 1. Transfer from 'stakeholders' array
                if (task.stakeholders && task.stakeholders.some(s => s.name === fromName)) {
                    // Remove 'from' stakeholder
                    const filtered = task.stakeholders.filter(s => s.name !== fromName);
                    
                    // Add 'to' stakeholder if not already present
                    const alreadyHasTo = filtered.some(s => s.name === toName);
                    if (!alreadyHasTo) {
                        // We need to construct a Stakeholder object for 'toName'. 
                        // Ideally we look it up, but for the reducer we might have to create a placeholder 
                        // or rely on the fact that 'toName' exists elsewhere.
                        // For simplicity, we preserve the ID/Role of 'from' but change name, 
                        // OR strictly we should find the 'to' stakeholder details.
                        // Since this is a simple transfer, we will just add the name and empty role if we can't find it,
                        // but in a real app we'd lookup. Here we'll just instantiate.
                        filtered.push({ id: `sh-trans-${Date.now()}`, name: toName, role: '' }); 
                    }
                    updatedStakeholders = filtered;
                }

                // 2. Transfer from 'featureRequests'
                if (task.featureRequests) {
                    updatedFeatureRequests = task.featureRequests.map(fr => {
                        if (fr.requestorName === fromName) {
                            return { ...fr, requestorName: toName };
                        }
                        return fr;
                    });
                }

                return {
                    ...task,
                    stakeholders: updatedStakeholders,
                    featureRequests: updatedFeatureRequests
                };
            })
        };
    case 'INVITE_STAKEHOLDERS':
        return {
            ...state,
            tasks: state.tasks.map(task => {
                if (!task.stakeholders) return task;
                return {
                    ...task,
                    stakeholders: task.stakeholders.map(sh =>
                        action.payload.includes(sh.name)
                            ? { ...sh, invited: true }
                            : sh
                    ),
                };
            }),
        };
    case 'BULK_UPDATE_TASKS':
        return {
            ...state,
            tasks: state.tasks.map(task => 
                action.payload.ids.includes(task.id)
                    ? { ...task, ...action.payload.updates }
                    : task
            ),
        };
    case 'BULK_DELETE_TASKS':
        return {
            ...state,
            tasks: state.tasks.filter(task => !action.payload.includes(task.id)),
        };
    default:
      return state;
  }
};

const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = React.useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
