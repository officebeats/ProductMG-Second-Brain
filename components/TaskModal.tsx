import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { summarizeComments, generateUpdatedDescription, analyzeFeatureRequest } from '../services/geminiService';
import type { Task, UserStory, BugReportEntry, FeatureRequestEntry, Stakeholder, Attachment, Comment, User } from '../types';
import { TaskStatus, TaskType, TaskPriority } from '../types';
import { SparklesIcon, SpinnerIcon, TrashIcon, PlusIcon, PaperclipIcon, CloseIcon, CopyIcon, ExportIcon, MaximizeIcon, MinimizeIcon } from './icons/Icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  user: User;
  onPreviewAttachment: (attachment: Attachment) => void;
}

const getInitialFormData = (): Omit<Task, 'id' | 'createdAt'> => ({
    title: '',
    description: '',
    status: TaskStatus.Triage,
    type: TaskType.FeatureRequest,
    priority: TaskPriority.Medium,
    dueDate: '',
    product: '',
    userStories: [],
    bugReports: [],
    featureRequests: [],
    stakeholders: [],
    attachments: [],
    comments: [],
});

const AutoGrowTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoGrow();
  }, [props.value]);
  
  return <textarea ref={textareaRef} {...props} rows={1} onInput={autoGrow} className={`${props.className} resize-none overflow-hidden`} />;
};


const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, user, onPreviewAttachment }) => {
  const { dispatch } = useAppContext();
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt'>>(getInitialFormData());
  const [newComment, setNewComment] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isUpdatingDesc, setIsUpdatingDesc] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyzingRequestId, setAnalyzingRequestId] = useState<string | null>(null);
  
  // Drag-and-drop state
  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [draggedBugId, setDraggedBugId] = useState<string | null>(null);
  const [dropTargetBugId, setDropTargetBugId] = useState<string | null>(null);
  const [draggedFeatureRequestId, setDraggedFeatureRequestId] = useState<string | null>(null);
  const [dropTargetFeatureRequestId, setDropTargetFeatureRequestId] = useState<string | null>(null);
  
  // Maximize view state
  const [maximizedTable, setMaximizedTable] = useState<'userStories' | 'bugReports' | 'featureRequests' | null>(null);


  useEffect(() => {
    if (isOpen) { 
      if (task) {
        setFormData({
            ...getInitialFormData(),
            ...task,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            userStories: task.userStories || [],
            bugReports: task.bugReports || [],
            featureRequests: task.featureRequests || [],
            stakeholders: task.stakeholders || [],
            attachments: task.attachments || [],
            comments: task.comments || [],
        });
      } else {
        setFormData(getInitialFormData());
      }
      setAiSummary(null); // Reset summary on open
      setMaximizedTable(null); // Reset maximized view on open
    }
  }, [task, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

  // --- User Story Handlers ---
    const handleAddUserStory = () => {
        const newUserStory: UserStory = { id: `us-${Date.now()}`, title: '', story: '', acceptanceCriteria: '', };
        setFormData(prev => ({ ...prev, userStories: [...(prev.userStories || []), newUserStory] }));
    };
    const handleUserStoryChange = (index: number, field: keyof UserStory, value: string) => {
        setFormData(prev => {
            const newUserStories = [...(prev.userStories || [])];
            newUserStories[index] = { ...newUserStories[index], [field]: value };
            return { ...prev, userStories: newUserStories };
        });
    };
    const handleRemoveUserStory = (id: string) => {
        setFormData(prev => ({ ...prev, userStories: (prev.userStories || []).filter(us => us.id !== id) }));
    };
    const formatStoryForCopy = (story: UserStory): string => `Title: ${story.title}\n\nUser Story:\n${story.story}\n\nAcceptance Criteria:\n${story.acceptanceCriteria}`;
    const handleCopyIndividualStory = (story: UserStory) => copyToClipboard(formatStoryForCopy(story), story.id);
    const handleCopyAllStories = () => {
        const allStoriesText = (formData.userStories || []).map(story => `-----------------\n${formatStoryForCopy(story)}`).join('\n\n');
        copyToClipboard(allStoriesText, 'all-stories');
    };
    const handleExportStoriesToCSV = () => {
        const stories = formData.userStories || [];
        if (stories.length === 0) return;
        const headers = ['Title', 'User Story', 'Acceptance Criteria'];
        const csvRows = [headers.join(',')];
        const escapeCsvCell = (cell: string) => cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell.replace(/"/g, '""')}"` : cell;
        stories.forEach(story => {
            const row = [ escapeCsvCell(story.title), escapeCsvCell(story.story), escapeCsvCell(story.acceptanceCriteria) ].join(',');
            csvRows.push(row);
        });
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `user-stories-${task?.id || 'new-task'}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const handleStoryDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        if (!draggedStoryId || !dropTargetId || draggedStoryId === dropTargetId) { setDropTargetId(null); return; };
        setFormData(prev => {
            const stories = [...(prev.userStories || [])];
            const fromIndex = stories.findIndex(s => s.id === draggedStoryId);
            const toIndex = stories.findIndex(s => s.id === dropTargetId);
            if (fromIndex === -1 || toIndex === -1) return prev;
            const [removed] = stories.splice(fromIndex, 1);
            stories.splice(toIndex, 0, removed);
            return { ...prev, userStories: stories };
        });
        setDropTargetId(null);
        setDraggedStoryId(null);
    };

    // --- Bug Report Handlers ---
    const handleAddBugReport = () => {
        const newBugReport: BugReportEntry = { id: `br-${Date.now()}`, title: '', currentBehavior: '', expectedBehavior: '' };
        setFormData(prev => ({ ...prev, bugReports: [...(prev.bugReports || []), newBugReport] }));
    };
    const handleBugReportChange = (index: number, field: keyof BugReportEntry, value: string) => {
        setFormData(prev => {
            const newBugReports = [...(prev.bugReports || [])];
            newBugReports[index] = { ...newBugReports[index], [field]: value };
            return { ...prev, bugReports: newBugReports };
        });
    };
    const handleRemoveBugReport = (id: string) => {
        setFormData(prev => ({ ...prev, bugReports: (prev.bugReports || []).filter(br => br.id !== id) }));
    };
    const formatBugForCopy = (bug: BugReportEntry): string => `Title: ${bug.title}\n\nCurrent Behavior:\n${bug.currentBehavior}\n\nExpected Behavior:\n${bug.expectedBehavior}`;
    const handleCopyIndividualBug = (bug: BugReportEntry) => copyToClipboard(formatBugForCopy(bug), bug.id);
    const handleCopyAllBugs = () => {
        const allBugsText = (formData.bugReports || []).map(bug => `-----------------\n${formatBugForCopy(bug)}`).join('\n\n');
        copyToClipboard(allBugsText, 'all-bugs');
    };
    const handleExportBugsToCSV = () => {
        const bugs = formData.bugReports || [];
        if (bugs.length === 0) return;
        const headers = ['Title', 'Current Behavior', 'Expected Behavior'];
        const csvRows = [headers.join(',')];
        const escapeCsvCell = (cell: string) => cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell.replace(/"/g, '""')}"` : cell;
        bugs.forEach(bug => {
            const row = [ escapeCsvCell(bug.title), escapeCsvCell(bug.currentBehavior), escapeCsvCell(bug.expectedBehavior) ].join(',');
            csvRows.push(row);
        });
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `bug-reports-${task?.id || 'new-task'}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const handleBugDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        if (!draggedBugId || !dropTargetBugId || draggedBugId === dropTargetBugId) { setDropTargetBugId(null); return; };
        setFormData(prev => {
            const bugs = [...(prev.bugReports || [])];
            const fromIndex = bugs.findIndex(b => b.id === draggedBugId);
            const toIndex = bugs.findIndex(b => b.id === dropTargetBugId);
            if (fromIndex === -1 || toIndex === -1) return prev;
            const [removed] = bugs.splice(fromIndex, 1);
            bugs.splice(toIndex, 0, removed);
            return { ...prev, bugReports: bugs };
        });
        setDropTargetBugId(null);
        setDraggedBugId(null);
    };
    
    // --- Feature Request Handlers ---
    const handleAddFeatureRequest = () => {
        const newFeatureRequest: FeatureRequestEntry = { id: `fr-${Date.now()}`, requestorName: '', rawRequest: '' };
        setFormData(prev => ({ ...prev, featureRequests: [...(prev.featureRequests || []), newFeatureRequest] }));
    };
    const handleFeatureRequestChange = (index: number, field: keyof FeatureRequestEntry, value: string) => {
        setFormData(prev => {
            const newFeatureRequests = [...(prev.featureRequests || [])];
            newFeatureRequests[index] = { ...newFeatureRequests[index], [field]: value };
            return { ...prev, featureRequests: newFeatureRequests };
        });
    };
    const handleRemoveFeatureRequest = (id: string) => {
        setFormData(prev => ({ ...prev, featureRequests: (prev.featureRequests || []).filter(fr => fr.id !== id) }));
    };
    const handleAnalyzeRequest = async (index: number) => {
        const request = formData.featureRequests?.[index];
        if (!request || !request.rawRequest) return;

        setAnalyzingRequestId(request.id);
        const analysis = await analyzeFeatureRequest(request.rawRequest);
        if (analysis) {
            setFormData(prev => {
                const newFeatureRequests = [...(prev.featureRequests || [])];
                newFeatureRequests[index] = { ...newFeatureRequests[index], ...analysis };
                return { ...prev, featureRequests: newFeatureRequests };
            });
        }
        setAnalyzingRequestId(null);
    }
    const formatFeatureRequestForCopy = (fr: FeatureRequestEntry): string => `Requestor: ${fr.requestorName} (${fr.requestorRole || 'N/A'})\n\nRaw Request:\n${fr.rawRequest}\n\nAI Analysis:\n- Pain Point: ${fr.painPoint || ''}\n- Business Context: ${fr.businessContext || ''}\n- Value: ${fr.value || ''}`;
    const handleCopyIndividualFeatureRequest = (fr: FeatureRequestEntry) => copyToClipboard(formatFeatureRequestForCopy(fr), fr.id);
    const handleCopyAllFeatureRequests = () => {
        const allFRsText = (formData.featureRequests || []).map(fr => `-----------------\n${formatFeatureRequestForCopy(fr)}`).join('\n\n');
        copyToClipboard(allFRsText, 'all-frs');
    };
    const handleExportFeatureRequestsToCSV = () => {
        const frs = formData.featureRequests || [];
        if (frs.length === 0) return;
        const headers = ['Requestor Name', 'Requestor Role', 'Raw Request', 'Pain Point', 'Business Context', 'Value'];
        const csvRows = [headers.join(',')];
        const escapeCsvCell = (cell: string = '') => cell.includes(',') || cell.includes('"') || cell.includes('\n') ? `"${cell.replace(/"/g, '""')}"` : cell;
        frs.forEach(fr => {
            const row = [ escapeCsvCell(fr.requestorName), escapeCsvCell(fr.requestorRole), escapeCsvCell(fr.rawRequest), escapeCsvCell(fr.painPoint), escapeCsvCell(fr.businessContext), escapeCsvCell(fr.value) ].join(',');
            csvRows.push(row);
        });
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `feature-requests-${task?.id || 'new-task'}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };
    const handleFeatureRequestDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.preventDefault();
        if (!draggedFeatureRequestId || !dropTargetFeatureRequestId || draggedFeatureRequestId === dropTargetFeatureRequestId) { setDropTargetFeatureRequestId(null); return; };
        setFormData(prev => {
            const frs = [...(prev.featureRequests || [])];
            const fromIndex = frs.findIndex(b => b.id === draggedFeatureRequestId);
            const toIndex = frs.findIndex(b => b.id === dropTargetFeatureRequestId);
            if (fromIndex === -1 || toIndex === -1) return prev;
            const [removed] = frs.splice(fromIndex, 1);
            frs.splice(toIndex, 0, removed);
            return { ...prev, featureRequests: frs };
        });
        setDropTargetFeatureRequestId(null);
        setDraggedFeatureRequestId(null);
    };

  // --- Stakeholder Handlers ---
  const handleAddStakeholder = () => { /* ... */ };
  const handleStakeholderChange = (index: number, field: keyof Stakeholder, value: string) => { /* ... */ };
  const handleRemoveStakeholder = (id: string) => { /* ... */ };

  // --- Attachment Handlers ---
  const processFiles = (files: FileList | null) => { /* ... */ }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => processFiles(e.target.files);
  const handleRemoveAttachment = (id: string) => { /* ... */ };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { /* ... */ };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { /* ... */ };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { /* ... */ };
  const handlePaste = useCallback((e: ClipboardEvent) => { /* ... */ }, []);

  // --- Comment Handlers ---
  const handleAddComment = () => {
      if (!newComment.trim() || !task) return;
      const comment: Comment = {
          id: `comment-${Date.now()}`,
          author: { name: user.name, avatarUrl: user.avatarUrl },
          content: newComment.trim(),
          createdAt: new Date().toISOString()
      };
      dispatch({ type: 'ADD_COMMENT', payload: { taskId: task.id, comment } });
      setFormData(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
      setNewComment('');
  };

  // --- AI Handlers ---
  const handleSummarize = async () => {
      if (!task) return;
      setIsSummarizing(true);
      const summary = await summarizeComments(task);
      setAiSummary(summary);
      setIsSummarizing(false);
  };

  const handleUpdateDescription = async () => {
      if (!task) return;
      setIsUpdatingDesc(true);
      const updatedDesc = await generateUpdatedDescription({ ...task, ...formData });
      setFormData(prev => ({ ...prev, description: updatedDesc }));
      setIsUpdatingDesc(false);
  }

  // --- Form Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTaskData = { ...formData };
    delete finalTaskData.comments; // Comments are handled separately
    if (!finalTaskData.dueDate) delete finalTaskData.dueDate;
    
    if (task) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...finalTaskData, id: task.id, createdAt: task.createdAt } as Task });
    } else {
      dispatch({ type: 'ADD_TASK', payload: { ...finalTaskData, id: `task-${Date.now()}`, createdAt: new Date().toISOString() } as Task });
    }
    onClose();
  };
  
    // Common styles
    const NeumorphicActionButton = "flex items-center px-3 py-1 rounded-lg font-semibold text-sm shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const StandardTextarea = "w-full p-2.5 text-sm bg-light-bg dark:bg-dark-shadow-2 border border-light-shadow-2/30 dark:border-dark-shadow-1 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-light-text dark:text-dark-text";


  // --- Reusable Table Components ---
    const UserStoryTable = () => (
        <div className="border border-light-shadow-2/30 dark:border-dark-shadow-2/80 rounded-xl">
            <div className="max-h-96 md:max-h-[none] overflow-y-auto relative">
                <table className="hidden md:table w-full text-sm table-fixed border-collapse">
                    <thead className="text-left align-top sticky top-0 z-10 bg-light-bg dark:bg-dark-shadow-2">
                        <tr className="text-light-text dark:text-dark-text">
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 w-10 text-center">#</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 w-[20%]">Title</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">User Story</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">Acceptance Criteria</th>
                            <th className="p-3 font-semibold border-b border-r-0 border-light-shadow-2/40 dark:border-dark-shadow-1 w-12 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(formData.userStories || []).map((story, index) => (
                            <tr key={story.id} 
                                draggable
                                onDragStart={() => setDraggedStoryId(story.id)}
                                onDragEnd={() => setDraggedStoryId(null)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={() => { if (draggedStoryId && draggedStoryId !== story.id) setDropTargetId(story.id); }}
                                onDragLeave={() => { if (dropTargetId === story.id) setDropTargetId(null); }}
                                onDrop={handleStoryDrop}
                                className={`align-top hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 cursor-grab ${draggedStoryId === story.id ? 'opacity-30 cursor-grabbing' : ''} ${dropTargetId === story.id ? 'border-t-2 border-brand-primary' : ''}`}
                            >
                                <td className="p-3 text-center align-middle border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 font-medium text-light-text/70 dark:text-dark-text/70">
                                    {index + 1}
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                    <AutoGrowTextarea value={story.title} onChange={(e) => handleUserStoryChange(index, 'title', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="Story Title"/>
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                    <AutoGrowTextarea value={story.story} onChange={(e) => handleUserStoryChange(index, 'story', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="As a [user type]..."/>
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                    <AutoGrowTextarea value={story.acceptanceCriteria} onChange={(e) => handleUserStoryChange(index, 'acceptanceCriteria', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="- Given [context]..."/>
                                </td>
                                <td className="p-1 border-b border-light-shadow-2/40 dark:border-dark-shadow-1 align-middle">
                                    <div className="flex flex-col items-center justify-center space-y-2 h-full">
                                        <button type="button" onClick={() => handleCopyIndividualStory(story)} title={copiedId === story.id ? 'Copied!' : 'Copy story'} className="p-1 rounded hover:bg-brand-secondary/20 transition-colors">
                                            <CopyIcon className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => handleRemoveUserStory(story.id)} title="Delete story" className="p-1 rounded text-red-500 hover:bg-red-200/50 transition-colors">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="md:hidden space-y-4 p-2">
                    {(formData.userStories || []).map((story, index) => (
                        <div key={story.id} className="p-4 rounded-lg border border-light-shadow-2/30 dark:border-dark-shadow-2/80 relative">
                            <div className="space-y-3">
                                <div><label className="block text-sm font-medium mb-1">Title</label><AutoGrowTextarea value={story.title} onChange={(e) => handleUserStoryChange(index, 'title', e.target.value)} className={StandardTextarea} placeholder="Story Title"/></div>
                                <div><label className="block text-sm font-medium mb-1">User Story</label><AutoGrowTextarea value={story.story} onChange={(e) => handleUserStoryChange(index, 'story', e.target.value)} className={StandardTextarea} placeholder="As a [user type]..."/></div>
                                <div><label className="block text-sm font-medium mb-1">Acceptance Criteria</label><AutoGrowTextarea value={story.acceptanceCriteria} onChange={(e) => handleUserStoryChange(index, 'acceptanceCriteria', e.target.value)} className={StandardTextarea} placeholder="- Given [context]..."/></div>
                                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                                    <button type="button" onClick={() => handleCopyIndividualStory(story)} title={copiedId === story.id ? 'Copied!' : 'Copy story'} className="flex items-center text-xs p-1 rounded hover:bg-brand-secondary/20 transition-colors"><CopyIcon className="h-4 w-4" /></button>
                                    <button type="button" onClick={() => handleRemoveUserStory(story.id)} title="Delete story" className="flex items-center text-xs p-1 rounded text-red-500 hover:bg-red-200/50 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const BugReportTable = () => (
         <div className="border border-light-shadow-2/30 dark:border-dark-shadow-2/80 rounded-xl">
            <div className="max-h-96 md:max-h-[none] overflow-y-auto relative">
                <table className="hidden md:table w-full text-sm table-fixed border-collapse">
                    <thead className="text-left align-top sticky top-0 z-10 bg-light-bg dark:bg-dark-shadow-2">
                        <tr className="text-light-text dark:text-dark-text">
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 w-10 text-center">#</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 w-[20%]">Title</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">Current Behavior</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">Expected Behavior</th>
                            <th className="p-3 font-semibold border-b border-r-0 border-light-shadow-2/40 dark:border-dark-shadow-1 w-12 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(formData.bugReports || []).map((bug, index) => (
                            <tr key={bug.id} 
                                draggable
                                onDragStart={() => setDraggedBugId(bug.id)}
                                onDragEnd={() => setDraggedBugId(null)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={() => { if (draggedBugId && draggedBugId !== bug.id) setDropTargetBugId(bug.id); }}
                                onDragLeave={() => { if (dropTargetBugId === bug.id) setDropTargetBugId(null); }}
                                onDrop={handleBugDrop}
                                className={`align-top hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 cursor-grab ${draggedBugId === bug.id ? 'opacity-30 cursor-grabbing' : ''} ${dropTargetBugId === bug.id ? 'border-t-2 border-brand-primary' : ''}`}
                            >
                                <td className="p-3 text-center align-middle border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 font-medium text-light-text/70 dark:text-dark-text/70">
                                    {index + 1}
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                    <AutoGrowTextarea value={bug.title} onChange={(e) => handleBugReportChange(index, 'title', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="Summary of the bug"/>
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                    <AutoGrowTextarea value={bug.currentBehavior} onChange={(e) => handleBugReportChange(index, 'currentBehavior', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="What is happening now?"/>
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                    <AutoGrowTextarea value={bug.expectedBehavior} onChange={(e) => handleBugReportChange(index, 'expectedBehavior', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="What should be happening?"/>
                                </td>
                                <td className="p-1 border-b border-light-shadow-2/40 dark:border-dark-shadow-1 align-middle">
                                    <div className="flex flex-col items-center justify-center space-y-2 h-full">
                                        <button type="button" onClick={() => handleCopyIndividualBug(bug)} title={copiedId === bug.id ? 'Copied!' : 'Copy bug report'} className="p-1 rounded hover:bg-brand-secondary/20 transition-colors">
                                            <CopyIcon className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => handleRemoveBugReport(bug.id)} title="Delete bug report" className="p-1 rounded text-red-500 hover:bg-red-200/50 transition-colors">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <div className="md:hidden space-y-4 p-2">
                    {(formData.bugReports || []).map((bug, index) => (
                        <div key={bug.id} className="p-4 rounded-lg border border-light-shadow-2/30 dark:border-dark-shadow-2/80 relative">
                            <div className="space-y-3">
                                <div><label className="block text-sm font-medium mb-1">Title</label><AutoGrowTextarea value={bug.title} onChange={(e) => handleBugReportChange(index, 'title', e.target.value)} className={StandardTextarea} placeholder="Summary of the bug"/></div>
                                <div><label className="block text-sm font-medium mb-1">Current Behavior</label><AutoGrowTextarea value={bug.currentBehavior} onChange={(e) => handleBugReportChange(index, 'currentBehavior', e.target.value)} className={StandardTextarea} placeholder="What is happening now?"/></div>
                                <div><label className="block text-sm font-medium mb-1">Expected Behavior</label><AutoGrowTextarea value={bug.expectedBehavior} onChange={(e) => handleBugReportChange(index, 'expectedBehavior', e.target.value)} className={StandardTextarea} placeholder="What should be happening?"/></div>
                                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                                    <button type="button" onClick={() => handleCopyIndividualBug(bug)} title={copiedId === bug.id ? 'Copied!' : 'Copy bug report'} className="flex items-center text-xs p-1 rounded hover:bg-brand-secondary/20 transition-colors"><CopyIcon className="h-4 w-4" /></button>
                                    <button type="button" onClick={() => handleRemoveBugReport(bug.id)} title="Delete bug report" className="flex items-center text-xs p-1 rounded text-red-500 hover:bg-red-200/50 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const FeatureRequestTable = () => (
         <div className="border border-light-shadow-2/30 dark:border-dark-shadow-2/80 rounded-xl">
            <div className="max-h-96 md:max-h-[none] overflow-y-auto relative">
                <table className="hidden md:table w-full text-sm table-fixed border-collapse">
                    <thead className="text-left align-top sticky top-0 z-10 bg-light-bg dark:bg-dark-shadow-2">
                        <tr className="text-light-text dark:text-dark-text">
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 w-10 text-center">#</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 w-[20%]">Requestor</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 w-[25%]">Raw Request</th>
                            <th className="p-3 font-semibold border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">AI Analysis</th>
                            <th className="p-3 font-semibold border-b border-r-0 border-light-shadow-2/40 dark:border-dark-shadow-1 w-12 text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(formData.featureRequests || []).map((req, index) => (
                            <tr key={req.id} 
                                draggable
                                onDragStart={() => setDraggedFeatureRequestId(req.id)}
                                onDragEnd={() => setDraggedFeatureRequestId(null)}
                                onDragOver={(e) => e.preventDefault()}
                                onDragEnter={() => { if (draggedFeatureRequestId && draggedFeatureRequestId !== req.id) setDropTargetFeatureRequestId(req.id); }}
                                onDragLeave={() => { if (dropTargetFeatureRequestId === req.id) setDropTargetFeatureRequestId(null); }}
                                onDrop={handleFeatureRequestDrop}
                                className={`align-top hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 cursor-grab ${draggedFeatureRequestId === req.id ? 'opacity-30 cursor-grabbing' : ''} ${dropTargetFeatureRequestId === req.id ? 'border-t-2 border-brand-primary' : ''}`}
                            >
                                <td className="p-3 text-center align-middle border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 font-medium text-light-text/70 dark:text-dark-text/70">
                                    {index + 1}
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                   <div className="flex flex-col h-full">
                                        <input type="text" value={req.requestorName} onChange={(e) => handleFeatureRequestChange(index, 'requestorName', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 border-b border-light-shadow-2/40 dark:border-dark-shadow-1 text-light-text dark:text-dark-text" placeholder="Requestor Name"/>
                                        <input type="text" value={req.requestorRole || ''} onChange={(e) => handleFeatureRequestChange(index, 'requestorRole', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="Role (Optional)"/>
                                   </div>
                                </td>
                                <td className="p-0 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1">
                                    <AutoGrowTextarea value={req.rawRequest} onChange={(e) => handleFeatureRequestChange(index, 'rawRequest', e.target.value)} className="w-full bg-transparent p-3 text-sm focus:outline-none focus:bg-brand-secondary/10 text-light-text dark:text-dark-text" placeholder="Paste the raw user request here..."/>
                                </td>
                                <td className="p-3 border-b border-r border-light-shadow-2/40 dark:border-dark-shadow-1 align-top">
                                    <div className="space-y-2">
                                        <button type="button" onClick={() => handleAnalyzeRequest(index)} disabled={analyzingRequestId === req.id || !req.rawRequest.trim()} className={`${NeumorphicActionButton} w-full justify-center text-brand-primary text-xs py-1`}>
                                            {analyzingRequestId === req.id ? <SpinnerIcon /> : <SparklesIcon className="h-4 w-4" />}
                                            <span className="ml-1">Analyze</span>
                                        </button>
                                         <div>
                                            <h5 className="text-xs font-bold mb-0.5 text-light-text dark:text-dark-text">Pain Point</h5>
                                            <p className="text-xs leading-snug text-light-text/80 dark:text-dark-text/80">{req.painPoint || '...'}</p>
                                        </div>
                                         <div>
                                            <h5 className="text-xs font-bold mb-0.5 text-light-text dark:text-dark-text">Business Context</h5>
                                            <p className="text-xs leading-snug text-light-text/80 dark:text-dark-text/80">{req.businessContext || '...'}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold mb-0.5 text-light-text dark:text-dark-text">Value</h5>
                                            <p className="text-xs leading-snug text-light-text/80 dark:text-dark-text/80">{req.value || '...'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-1 border-b border-light-shadow-2/40 dark:border-dark-shadow-1 align-middle">
                                    <div className="flex flex-col items-center justify-center space-y-2 h-full">
                                        <button type="button" onClick={() => handleCopyIndividualFeatureRequest(req)} title={copiedId === req.id ? 'Copied!' : 'Copy request'} className="p-1 rounded hover:bg-brand-secondary/20 transition-colors">
                                            <CopyIcon className="h-4 w-4" />
                                        </button>
                                        <button type="button" onClick={() => handleRemoveFeatureRequest(req.id)} title="Delete request" className="p-1 rounded text-red-500 hover:bg-red-200/50 transition-colors">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );


  if (!isOpen) return null;
  
  const formatDate = (isoString: string) => new Date(isoString).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const NeumorphicInput = "w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-200";
  const NeumorphicPrimaryButton = "px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-[95vw] max-w-[1800px] h-[95vh] animate-fade-in" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="w-full bg-transparent text-2xl font-bold focus:outline-none" placeholder="Task Title" required />
            </div>

            <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-y-auto">
                {/* --- MAIN CONTENT (LEFT) --- */}
                <div className="lg:col-span-4 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="description" className="block text-lg font-semibold">Description</label>
                            <button type="button" onClick={handleUpdateDescription} disabled={isUpdatingDesc || !task} className="flex items-center text-xs font-semibold text-brand-primary disabled:opacity-50">
                                {isUpdatingDesc ? <SpinnerIcon /> : <SparklesIcon className="h-4 w-4" />}
                                <span className="ml-1">Update from Activity</span>
                            </button>
                        </div>
                        <AutoGrowTextarea name="description" id="description" value={formData.description} onChange={handleChange} className={NeumorphicInput} required></AutoGrowTextarea>
                    </div>

                    {/* --- REQUIREMENTS SECTION --- */}
                    {formData.type === TaskType.Requirements && (
                        <div>
                            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                                <h3 className="text-lg font-semibold">User Stories ({(formData.userStories || []).length})</h3>
                                <div className="flex items-center space-x-2">
                                    <button type="button" onClick={handleAddUserStory} className={NeumorphicActionButton}>
                                        <PlusIcon /> <span className="ml-1">Add Story</span>
                                    </button>
                                    <button type="button" onClick={handleCopyAllStories} disabled={(formData.userStories || []).length === 0} className={NeumorphicActionButton}>
                                        <CopyIcon /> <span className="ml-1">{copiedId === 'all-stories' ? 'Copied!' : 'Copy All'}</span>
                                    </button>
                                    <button type="button" onClick={handleExportStoriesToCSV} disabled={(formData.userStories || []).length === 0} className={NeumorphicActionButton}>
                                        <ExportIcon /> <span className="ml-1">Export CSV</span>
                                    </button>
                                    <button type="button" onClick={() => setMaximizedTable('userStories')} className={NeumorphicActionButton} aria-label="Maximize user stories table">
                                        <MaximizeIcon />
                                    </button>
                                </div>
                            </div>
                           <UserStoryTable />
                        </div>
                    )}

                     {/* --- BUG REPORT SECTION --- */}
                    {formData.type === TaskType.BugReport && (
                        <div>
                            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                                <h3 className="text-lg font-semibold">Bug Reports ({(formData.bugReports || []).length})</h3>
                                <div className="flex items-center space-x-2">
                                    <button type="button" onClick={handleAddBugReport} className={NeumorphicActionButton}>
                                        <PlusIcon /> <span className="ml-1">Add Bug</span>
                                    </button>
                                    <button type="button" onClick={handleCopyAllBugs} disabled={(formData.bugReports || []).length === 0} className={NeumorphicActionButton}>
                                        <CopyIcon /> <span className="ml-1">{copiedId === 'all-bugs' ? 'Copied!' : 'Copy All'}</span>
                                    </button>
                                    <button type="button" onClick={handleExportBugsToCSV} disabled={(formData.bugReports || []).length === 0} className={NeumorphicActionButton}>
                                        <ExportIcon /> <span className="ml-1">Export CSV</span>
                                    </button>
                                     <button type="button" onClick={() => setMaximizedTable('bugReports')} className={NeumorphicActionButton} aria-label="Maximize bug reports table">
                                        <MaximizeIcon />
                                    </button>
                                </div>
                            </div>
                           <BugReportTable />
                        </div>
                    )}

                    {/* --- FEATURE REQUEST SECTION --- */}
                    {formData.type === TaskType.FeatureRequest && (
                        <div>
                            <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                                <h3 className="text-lg font-semibold">Feature Requests ({(formData.featureRequests || []).length})</h3>
                                <div className="flex items-center space-x-2">
                                    <button type="button" onClick={handleAddFeatureRequest} className={NeumorphicActionButton}>
                                        <PlusIcon /> <span className="ml-1">Add Request</span>
                                    </button>
                                    <button type="button" onClick={handleCopyAllFeatureRequests} disabled={(formData.featureRequests || []).length === 0} className={NeumorphicActionButton}>
                                        <CopyIcon /> <span className="ml-1">{copiedId === 'all-frs' ? 'Copied!' : 'Copy All'}</span>
                                    </button>
                                    <button type="button" onClick={handleExportFeatureRequestsToCSV} disabled={(formData.featureRequests || []).length === 0} className={NeumorphicActionButton}>
                                        <ExportIcon /> <span className="ml-1">Export CSV</span>
                                    </button>
                                     <button type="button" onClick={() => setMaximizedTable('featureRequests')} className={NeumorphicActionButton} aria-label="Maximize feature requests table">
                                        <MaximizeIcon />
                                    </button>
                                </div>
                            </div>
                           <FeatureRequestTable />
                        </div>
                    )}


                    {/* --- STAKEHOLDER SECTION --- */}
                    {formData.type === TaskType.Stakeholder && ( <div>{/* ... as before ... */}</div> )}

                    {/* --- ATTACHMENTS SECTION --- */}
                    <div>{/* ... as before ... */}</div>
                    
                    {/* Activity Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Activity</h3>
                        {task && (formData.comments || []).length > 0 && (
                            <div className="mb-4">
                                {aiSummary && (
                                    <div className="p-3 mb-3 rounded-lg bg-brand-secondary/20 relative">
                                        <button type="button" onClick={() => setAiSummary(null)} className="absolute top-2 right-2"><CloseIcon className="h-4 w-4" /></button>
                                        <h4 className="font-semibold text-sm mb-1 flex items-center"><SparklesIcon className="h-4 w-4 mr-1"/> AI Summary</h4>
                                        <p className="text-sm whitespace-pre-wrap">{aiSummary}</p>
                                    </div>
                                )}
                                <button type="button" onClick={handleSummarize} disabled={isSummarizing} className="w-full flex items-center justify-center text-sm font-semibold text-brand-primary p-2 rounded-lg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset disabled:opacity-50">
                                    {isSummarizing ? <SpinnerIcon /> : <SparklesIcon />}
                                    <span className="ml-2">Summarize Activity</span>
                                </button>
                            </div>
                        )}
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                           {(formData.comments || []).map(comment => (
                               <div key={comment.id} className="flex items-start space-x-3">
                                   <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full shadow-sm mt-1" />
                                   <div className="flex-1 p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm">
                                       <div className="flex items-center justify-between text-xs mb-1">
                                           <span className="font-semibold">{comment.author.name}</span>
                                           <span className="opacity-70">{formatDate(comment.createdAt)}</span>
                                       </div>
                                       <p className="text-sm">{comment.content}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                         {task && (
                            <div className="mt-4">
                                 <AutoGrowTextarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className={`${NeumorphicInput} mb-2`} />
                                 <button type="button" onClick={handleAddComment} disabled={!newComment.trim()} className={`${NeumorphicPrimaryButton} text-sm py-1.5 px-3 float-right`}>Comment</button>
                            </div>
                         )}
                    </div>
                </div>

                {/* --- METADATA (RIGHT) --- */}
                <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset">
                        <h3 className="text-lg font-semibold mb-4">Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product</label>
                                <input type="text" name="product" value={formData.product || ''} onChange={handleChange} className={NeumorphicInput} placeholder="e.g., Platform Core" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className={NeumorphicInput}>
                                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className={NeumorphicInput}>
                                    {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Priority</label>
                                <select name="priority" value={formData.priority} onChange={handleChange} className={NeumorphicInput}>
                                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Due Date</label>
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={NeumorphicInput} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 flex justify-end space-x-3 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl font-semibold shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset active:shadow-neumorphic-light-sm-inset dark:active:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200">Cancel</button>
                <button type="submit" className={NeumorphicPrimaryButton}>Save Task</button>
            </div>
        </form>
      </div>
        {maximizedTable && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={() => setMaximizedTable(null)}>
                <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-full h-full flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-4 flex justify-between items-center border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                        <h2 className="text-xl font-bold">
                            {maximizedTable === 'userStories' && 'User Stories'}
                            {maximizedTable === 'bugReports' && 'Bug Reports'}
                            {maximizedTable === 'featureRequests' && 'Feature Requests'}
                        </h2>
                        <button onClick={() => setMaximizedTable(null)} className={NeumorphicActionButton} aria-label="Minimize table view">
                           <MinimizeIcon />
                        </button>
                    </div>
                    <div className="flex-grow p-4 overflow-auto">
                        {maximizedTable === 'userStories' && <UserStoryTable />}
                        {maximizedTable === 'bugReports' && <BugReportTable />}
                        {maximizedTable === 'featureRequests' && <FeatureRequestTable />}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default TaskModal;