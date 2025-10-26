
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import type { Task, Comment } from '../types';
import { TaskStatus, TaskType, TaskPriority } from '../types';
import { INITIAL_TASKS } from '../constants';

interface AppState {
  tasks: Task[];
  filters: {
    searchQuery: string;
    type: TaskType | 'All';
    priority: TaskPriority | 'All';
    status: TaskStatus | 'All';
  };
}

type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string } // id
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStatus: TaskStatus } }
  | { type: 'SET_FILTERS', payload: Partial<AppState['filters']> }
  | { type: 'ADD_COMMENT', payload: { taskId: string; comment: Comment } };

const initialState: AppState = {
  tasks: INITIAL_TASKS,
  filters: {
    searchQuery: '',
    type: 'All',
    priority: 'All',
    status: 'All',
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
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};