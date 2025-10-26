
import React, { useState, useCallback } from 'react';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import TaskModal from './components/TaskModal';
import FilterBar from './components/FilterBar';
import AttachmentPreviewModal from './components/AttachmentPreviewModal';
import type { User, Task, Attachment } from './types';
import { ViewType } from './types';


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewType>(ViewType.Kanban);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [previewingAttachment, setPreviewingAttachment] = useState<Attachment | null>(null);

  const handleLogin = useCallback(() => {
    setUser({
      name: 'Pat Product',
      email: 'pat.product@example.com',
      avatarUrl: `https://i.pravatar.cc/150?u=pat.product@example.com`,
    });
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);
  
  const openNewTaskModal = useCallback(() => {
    setEditingTask(null);
    setIsModalOpen(true);
  }, []);

  const openEditTaskModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTask(null);
  }, []);

  const openAttachmentPreview = useCallback((attachment: Attachment) => {
    setPreviewingAttachment(attachment);
  }, []);

  const closeAttachmentPreview = useCallback(() => {
    setPreviewingAttachment(null);
  }, []);

  if (!user) {
    return (
        <ThemeProvider>
            <Login onLogin={handleLogin} />
        </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <div className="bg-light-bg dark:bg-dark-bg min-h-screen font-sans text-light-text dark:text-dark-text transition-colors duration-300">
          <Header user={user} currentView={view} setView={setView} onNewTask={openNewTaskModal} onLogout={handleLogout} />
          <main className="p-4 sm:p-6 lg:p-8">
            <FilterBar />
            {view === ViewType.Kanban ? (
              <KanbanBoard onEditTask={openEditTaskModal} />
            ) : (
              <ListView onEditTask={openEditTaskModal} />
            )}
          </main>
          <TaskModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            task={editingTask}
            user={user}
            onPreviewAttachment={openAttachmentPreview}
          />
          {previewingAttachment && (
            <AttachmentPreviewModal 
              attachment={previewingAttachment}
              onClose={closeAttachmentPreview}
            />
          )}
        </div>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;