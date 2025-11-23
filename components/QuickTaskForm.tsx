
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, TaskStatus, TaskType, TaskPriority } from '../types';

interface QuickTaskFormProps {
    onClose: () => void;
}

const QuickTaskForm: React.FC<QuickTaskFormProps> = ({ onClose }) => {
    const { dispatch } = useAppContext();
    const [title, setTitle] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newTask: Task = {
            id: `task-${Date.now()}`,
            title: title.trim(),
            description: 'Quick task, details to be added.',
            status: TaskStatus.Triage,
            type: TaskType.FeatureRequest,
            priority: TaskPriority.Medium,
            createdAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_TASK', payload: newTask });
        setTitle('');
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="p-2 bg-light-bg dark:bg-dark-bg rounded-lg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset">
            <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full p-2 text-sm rounded-md bg-transparent focus:outline-none resize-none"
                rows={2}
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                    } else if (e.key === 'Escape') {
                        onClose();
                    }
                }}
            />
            <div className="flex items-center justify-end space-x-2 mt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1 text-xs rounded-md shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-3 py-1 text-xs text-white bg-brand-primary rounded-md shadow-md hover:opacity-90 transition-opacity"
                    disabled={!title.trim()}
                >
                    Add
                </button>
            </div>
        </form>
    );
};

export default QuickTaskForm;