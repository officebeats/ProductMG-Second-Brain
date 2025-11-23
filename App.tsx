
import * as React from 'react';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import StakeholderView from './components/StakeholderView';
import PrioritizationView from './components/PrioritizationView';
import TaskModal from './components/TaskModal';
import FilterBar from './components/FilterBar';
import AttachmentPreviewModal from './components/AttachmentPreviewModal';
import IdeaInputModal from './components/IdeaInputModal';
import BulkActionToolbar from './components/BulkActionToolbar';
import type { User, Task, Attachment } from './types';
import { ViewType, TaskStatus, TaskType, TaskPriority } from './types';
import { generateTaskTitleFromDescription } from './services/geminiService';
import { useAppContext } from './context/AppContext'; // Need to access context in a wrapper or child
// We need to split App content to use context
// creating a MainContent component below


const MainContent: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const { state, dispatch } = useAppContext();
    const [view, setView] = React.useState<ViewType>(ViewType.Kanban);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isIdeaInputOpen, setIsIdeaInputOpen] = React.useState(false);
    const [editingTask, setEditingTask] = React.useState<Task | null>(null);
    const [previewingAttachment, setPreviewingAttachment] = React.useState<Attachment | null>(null);
    
    // Bulk Selection State
    const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(new Set());

    // Clear selection when changing views to avoid confusion
    React.useEffect(() => {
        setSelectedTaskIds(new Set());
    }, [view]);

    const handleSelectionChange = React.useCallback((taskId: string, selected: boolean) => {
        setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(taskId);
            } else {
                newSet.delete(taskId);
            }
            return newSet;
        });
    }, []);

    const handleSelectAll = React.useCallback((taskIds: string[], selected: boolean) => {
        if (selected) {
            setSelectedTaskIds(new Set(taskIds));
        } else {
            setSelectedTaskIds(new Set());
        }
    }, []);
    
    const handleClearSelection = React.useCallback(() => {
        setSelectedTaskIds(new Set());
    }, []);

    const handleBulkUpdateStatus = React.useCallback((status: TaskStatus) => {
        dispatch({
            type: 'BULK_UPDATE_TASKS',
            payload: { ids: Array.from(selectedTaskIds), updates: { status } }
        });
        handleClearSelection();
    }, [dispatch, selectedTaskIds, handleClearSelection]);

    const handleBulkUpdatePriority = React.useCallback((priority: TaskPriority) => {
         dispatch({
            type: 'BULK_UPDATE_TASKS',
            payload: { ids: Array.from(selectedTaskIds), updates: { priority } }
        });
        handleClearSelection();
    }, [dispatch, selectedTaskIds, handleClearSelection]);

    const handleBulkDelete = React.useCallback(() => {
        if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.size} tasks?`)) {
             dispatch({
                type: 'BULK_DELETE_TASKS',
                payload: Array.from(selectedTaskIds)
            });
            handleClearSelection();
        }
    }, [dispatch, selectedTaskIds, handleClearSelection]);


    const openNewTaskModal = React.useCallback(() => {
        setEditingTask(null);
        setIsModalOpen(true);
    }, []);

    const openEditTaskModal = React.useCallback((task: Task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    }, []);

    const closeModal = React.useCallback(() => {
        setIsModalOpen(false);
        setEditingTask(null);
    }, []);
    
    const closeIdeaInput = React.useCallback(() => {
        setIsIdeaInputOpen(false);
    }, []);

    const handleIdeaSubmit = React.useCallback(async (description: string) => {
        const title = await generateTaskTitleFromDescription(description);
        setIsIdeaInputOpen(false);
        const newTaskTemplate: Task = {
            id: '', 
            title: title,
            description: description,
            type: TaskType.FeatureRequest,
            status: TaskStatus.Triage,
            priority: TaskPriority.Medium,
            createdAt: new Date().toISOString(),
            reach: 1, impact: 1, confidence: 1, effort: 1, risk: 1
        };
        setEditingTask(newTaskTemplate);
        setIsModalOpen(true);
    }, []);

    const openAttachmentPreview = React.useCallback((attachment: Attachment) => {
        setPreviewingAttachment(attachment);
    }, []);

    const closeAttachmentPreview = React.useCallback(() => {
        setPreviewingAttachment(null);
    }, []);

    const renderView = () => {
        switch(view) {
            case ViewType.Kanban:
                return <KanbanBoard onEditTask={openEditTaskModal} selectedTaskIds={selectedTaskIds} onSelectTask={handleSelectionChange} />;
            case ViewType.List:
                return <ListView onEditTask={openEditTaskModal} selectedTaskIds={selectedTaskIds} onSelectTask={handleSelectionChange} onSelectAll={handleSelectAll} />;
            case ViewType.Stakeholders:
                return <StakeholderView onEditTask={openEditTaskModal} />;
            case ViewType.Prioritization:
                return <PrioritizationView onEditTask={openEditTaskModal} onNewTask={() => setIsIdeaInputOpen(true)} />;
            default:
                return <KanbanBoard onEditTask={openEditTaskModal} selectedTaskIds={selectedTaskIds} onSelectTask={handleSelectionChange} />;
        }
    }

    return (
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen font-sans text-light-text dark:text-dark-text transition-colors duration-300">
            <Header user={user} currentView={view} setView={setView} onNewTask={openNewTaskModal} onLogout={onLogout} />
            <main className="p-2 sm:p-4 md:p-6 lg:p-8 pb-24"> {/* Added padding bottom for toolbar */}
                <FilterBar />
                {renderView()}
            </main>
            
            <BulkActionToolbar 
                selectedCount={selectedTaskIds.size}
                onClearSelection={handleClearSelection}
                onUpdateStatus={handleBulkUpdateStatus}
                onUpdatePriority={handleBulkUpdatePriority}
                onDelete={handleBulkDelete}
            />

            <TaskModal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                task={editingTask}
                user={user}
                onPreviewAttachment={openAttachmentPreview}
            />
            <IdeaInputModal 
                isOpen={isIdeaInputOpen}
                onClose={closeIdeaInput}
                onSubmit={handleIdeaSubmit}
            />
            {previewingAttachment && (
                <AttachmentPreviewModal 
                attachment={previewingAttachment}
                onClose={closeAttachmentPreview}
                />
            )}
        </div>
    );
}

const App: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);

  const handleLogin = React.useCallback(() => {
    setUser({
      name: 'Beats',
      email: 'beats@example.com',
      avatarUrl: `https://i.pravatar.cc/150?u=beats@example.com`,
    });
  }, []);

  const handleLogout = React.useCallback(() => {
    setUser(null);
  }, []);

  return (
    <ThemeProvider>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <AppProvider>
            <MainContent user={user} onLogout={handleLogout} />
        </AppProvider>
      )}
    </ThemeProvider>
  );
};

export default App;
