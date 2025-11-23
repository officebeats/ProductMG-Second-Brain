
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import { summarizeComments, generateUpdatedDescription, generateTaskContent, suggestTaskDetails, generateTaskTitleFromDescription } from '../services/geminiService';
import type { Task, Comment, User, Attachment, Stakeholder } from '../types';
import { TaskStatus, TaskType, TaskPriority } from '../types';
import { SparklesIcon, SpinnerIcon, PaperclipIcon, CloseIcon, TrashIcon, MaximizeIcon } from './icons/Icons';
import ImageCropperModal from './ImageCropperModal';
import { UserStoryTable } from './modal-sections/UserStoryTable';
import { BugReportTable } from './modal-sections/BugReportTable';
import { FeatureRequestTable } from './modal-sections/FeatureRequestTable';
import { StakeholderTable } from './modal-sections/StakeholderTable';
import RatingDots from './RatingDots';

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
    reach: 1,
    impact: 1,
    confidence: 1,
    effort: 1,
    risk: 1,
});

const AutoGrowTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const autoGrow = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };
  React.useEffect(() => { autoGrow(); }, [props.value]);
  return <textarea ref={textareaRef} {...props} rows={1} onInput={autoGrow} className={`${props.className} resize-none overflow-hidden`} />;
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, user, onPreviewAttachment }) => {
  const { state, dispatch } = useAppContext();
  const [formData, setFormData] = React.useState<Omit<Task, 'id' | 'createdAt'>>(getInitialFormData());
  const [newComment, setNewComment] = React.useState('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isUpdatingDesc, setIsUpdatingDesc] = React.useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = React.useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = React.useState(false);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [aiSummary, setAiSummary] = React.useState<string | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [editingStakeholderIndex, setEditingStakeholderIndex] = React.useState<number | null>(null);
  const [isAddingNewProduct, setIsAddingNewProduct] = React.useState(false);

  const uniqueProducts = React.useMemo(() => {
    const products = new Set<string>();
    state.tasks.forEach(task => {
        if (task.product) {
            products.add(task.product);
        }
    });
    return Array.from(products).sort();
  }, [state.tasks]);

  const allUniqueStakeholders = React.useMemo(() => {
    const stakeholdersMap = new Map<string, Stakeholder>();
    state.tasks.forEach(task => {
        // From dedicated stakeholders field
        task.stakeholders?.forEach(sh => {
            if (sh.name && !stakeholdersMap.has(sh.name)) {
                stakeholdersMap.set(sh.name, sh);
            }
        });
        // From feature requestors
        task.featureRequests?.forEach(fr => {
            if (fr.requestorName && !stakeholdersMap.has(fr.requestorName)) {
                stakeholdersMap.set(fr.requestorName, {
                    id: `sh-fr-${fr.id}`,
                    name: fr.requestorName,
                    role: fr.requestorRole,
                });
            }
        });
    });
    return Array.from(stakeholdersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.tasks]);

  React.useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({ ...getInitialFormData(), ...task, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', userStories: task.userStories || [], bugReports: task.bugReports || [], featureRequests: task.featureRequests || [], stakeholders: task.stakeholders || [], attachments: task.attachments || [], comments: task.comments || [] });
        const productExists = uniqueProducts.includes(task.product || '');
        setIsAddingNewProduct(!!task.product && !productExists);
      } else {
        setFormData(getInitialFormData());
        setIsAddingNewProduct(false);
      }
      setAiSummary(null);
    }
  }, [task, isOpen, uniqueProducts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (value === 'add_new') {
        setIsAddingNewProduct(true);
        setFormData(prev => ({ ...prev, product: '' }));
    } else {
        setIsAddingNewProduct(false);
        setFormData(prev => ({ ...prev, product: value }));
    }
  };

  const handleFormDataChange = React.useCallback((key: keyof Omit<Task, 'id' | 'createdAt'>, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const handleStakeholderPhotoEdit = (index: number) => {
    setEditingStakeholderIndex(index);
    setIsCropperOpen(true);
  };
  
  const handleStakeholderPhotoSave = (dataUrl: string) => {
    if (editingStakeholderIndex !== null) {
      const updatedStakeholders = [...(formData.stakeholders || [])];
      updatedStakeholders[editingStakeholderIndex].avatarData = dataUrl;
      handleFormDataChange('stakeholders', updatedStakeholders);
    }
    setIsCropperOpen(false);
    setEditingStakeholderIndex(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const processFiles = React.useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      const data = await fileToBase64(file);
      newAttachments.push({ id: `att-${Date.now()}-${Math.random()}`, name: file.name, type: file.type, data });
    }
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), ...newAttachments] }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => processFiles(e.target.files);
  const handleRemoveAttachment = (id: string) => setFormData(prev => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.id !== id) }));
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); processFiles(e.dataTransfer.files); };

  const handlePaste = React.useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      const fileList = new DataTransfer();
      files.forEach(file => fileList.items.add(file));
      processFiles(fileList.files);
    }
  }, [processFiles]);

  const handleAddComment = () => {
    if (!newComment.trim() || !task) return;
    const comment: Comment = { id: `comment-${Date.now()}`, author: { name: user.name, avatarUrl: user.avatarUrl }, content: newComment.trim(), createdAt: new Date().toISOString() };
    dispatch({ type: 'ADD_COMMENT', payload: { taskId: task.id, comment } });
    setFormData(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
    setNewComment('');
  };

  const handleSummarize = async () => {
    if (!task) return;
    setIsSummarizing(true);
    const currentTaskState = { ...task, ...formData };
    const summary = await summarizeComments(currentTaskState);
    setAiSummary(summary);
    setIsSummarizing(false);
  };

  const handleUpdateDescription = async () => {
    if (!task) return;
    setIsUpdatingDesc(true);
    const currentTaskState = { ...task, ...formData };
    const description = await generateUpdatedDescription(currentTaskState);
    setFormData(prev => ({ ...prev, description: description }));
    setIsUpdatingDesc(false);
  };
  
  const handleGenerateDescription = async () => {
    if (!formData.title) return;
    setIsGeneratingDesc(true);
    const description = await generateTaskContent(formData.title);
    setFormData(prev => ({ ...prev, description: description }));
    setIsGeneratingDesc(false);
  };

  const handleGenerateTitle = async () => {
    if (!formData.description) return;
    setIsGeneratingTitle(true);
    const title = await generateTaskTitleFromDescription(formData.description);
    setFormData(prev => ({ ...prev, title: title }));
    setIsGeneratingTitle(false);
  };

  const handleSuggestDetails = async () => { 
    if (!formData.title || !formData.description) return; 
    setIsSuggesting(true); 
    const suggestions = await suggestTaskDetails(formData.title, formData.description); 
    if (suggestions) setFormData(prev => ({...prev, ...suggestions})); 
    setIsSuggesting(false); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTaskData = { ...formData };
    delete finalTaskData.comments;
    if (!finalTaskData.dueDate) delete finalTaskData.dueDate;
    if (task) {
      dispatch({ type: 'UPDATE_TASK', payload: { ...finalTaskData, id: task.id, createdAt: task.createdAt } as Task });
    } else {
      dispatch({ type: 'ADD_TASK', payload: { ...finalTaskData, id: `task-${Date.now()}`, createdAt: new Date().toISOString() } as Task });
    }
    onClose();
  };
  
  // Tight, compact styles
  const NeumorphicInput = "w-full p-2 text-sm rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-200";
  const NeumorphicActionButton = "flex items-center justify-center px-2 py-1 rounded-lg font-semibold text-xs shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const LabelClass = "block text-xs font-bold mb-1 uppercase text-light-text/70 dark:text-dark-text/70";

  if (!isOpen) return null;
  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-40 p-2 sm:p-4" onClick={onClose}>
        <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-full max-w-6xl h-full max-h-[98vh] flex flex-col animate-fade-in" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Header */}
            <div className="p-3 flex justify-between items-center border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 flex-shrink-0">
              <h2 className="text-lg font-bold">{task ? 'Edit Task' : 'New Task'}</h2>
              <button type="button" onClick={onClose} className="p-1.5 rounded-lg transition-all duration-200 shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset" aria-label="Close"><CloseIcon className="h-4 w-4" /></button>
            </div>

            {/* Main Scrollable Content */}
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar" onPaste={handlePaste}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column (Main Info) - Spans 2 cols */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="relative">
                    <label htmlFor="title" className={LabelClass}>Title</label>
                    <div className="relative">
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className={`${NeumorphicInput} pr-24`} required placeholder="Task Title" />
                         <div className="absolute top-1 right-1 bottom-1">
                            <button type="button" onClick={handleGenerateTitle} disabled={!formData.description || isGeneratingTitle} className={`${NeumorphicActionButton} h-full px-2`} title="Generate title from description">
                                {isGeneratingTitle ? <SpinnerIcon /> : <SparklesIcon className="text-brand-primary h-3 w-3" />} <span className="ml-1">Generate</span>
                            </button>
                        </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="description" className={LabelClass}>Description</label>
                    <div className="relative">
                        <AutoGrowTextarea id="description" name="description" value={formData.description} onChange={handleChange} className={`${NeumorphicInput} pb-8`} rows={3} placeholder="Add a detailed description..." />
                        <div className="absolute bottom-2 right-2">
                        <button type="button" onClick={handleGenerateDescription} disabled={!formData.title || isGeneratingDesc} className={NeumorphicActionButton} title="Generate description from title">
                            {isGeneratingDesc ? <SpinnerIcon /> : <SparklesIcon className="text-brand-primary h-3 w-3" />} <span className="ml-1">Generate</span>
                        </button>
                        </div>
                    </div>
                  </div>
                  
                   {/* RICE Scoring Section - Compacted */}
                  <div>
                      <h3 className="text-sm font-bold mb-2 uppercase text-light-text/70 dark:text-dark-text/70">Prioritization</h3>
                      <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset grid grid-cols-5 gap-2">
                          {[
                              { label: 'Reach', key: 'reach' },
                              { label: 'Impact', key: 'impact' },
                              { label: 'Conf.', key: 'confidence' },
                              { label: 'Effort', key: 'effort' },
                              { label: 'Risk', key: 'risk' }
                          ].map(({ label, key }) => (
                               <div key={key} className="flex flex-col items-center">
                                  <label className="text-[10px] font-bold uppercase mb-1 text-center">{label}</label>
                                  <RatingDots 
                                    value={(formData as any)[key] || 0} 
                                    onChange={(v) => handleFormDataChange(key as any, v)} 
                                    colorClass={
                                        key === 'risk' ? "bg-red-500 dark:bg-red-400" : 
                                        key === 'reach' ? "bg-indigo-500 dark:bg-indigo-400" :
                                        key === 'impact' ? "bg-blue-500 dark:bg-blue-400" :
                                        key === 'confidence' ? "bg-green-500 dark:bg-green-400" :
                                        "bg-yellow-500 dark:bg-yellow-400"
                                    } 
                                    size="sm"
                                  />
                              </div>
                          ))}
                      </div>
                  </div>
                </div>
                
                {/* Right Column (Meta Info) - Compact Grid */}
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={LabelClass}>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={NeumorphicInput}>
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={LabelClass}>Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className={NeumorphicInput}>
                                {Object.values(TaskType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className={LabelClass}>Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} className={NeumorphicInput}>
                                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className={LabelClass}>Due Date</label>
                            <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={NeumorphicInput} />
                        </div>
                        <div className="col-span-2">
                             <label className={LabelClass}>Product</label>
                             {isAddingNewProduct ? (
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        name="product"
                                        value={formData.product || ''}
                                        onChange={handleChange}
                                        className={NeumorphicInput}
                                        placeholder="New product name"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingNewProduct(false);
                                            setFormData(prev => ({ ...prev, product: '' }));
                                        }}
                                        className="text-xs font-semibold text-light-text/70 dark:text-dark-text/70"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <select
                                    id="product-select"
                                    name="product"
                                    value={formData.product || ''}
                                    onChange={handleProductChange}
                                    className={NeumorphicInput}
                                >
                                    <option value="">Select a product</option>
                                    {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                                    <option value="add_new" className="font-bold text-brand-primary">-- Add New Product --</option>
                                </select>
                            )}
                        </div>
                        <div className="col-span-2">
                             <button type="button" onClick={handleSuggestDetails} disabled={!formData.title || !formData.description || isSuggesting} className={`${NeumorphicActionButton} w-full py-2`}>
                                {isSuggesting ? <SpinnerIcon /> : <SparklesIcon className="text-brand-primary h-4 w-4" />} <span className="ml-1">Suggest Details</span>
                            </button>
                        </div>
                    </div>
                </div>
              </div>
                
              <div className="mt-6 space-y-6">
                  {formData.type === TaskType.Requirements && <UserStoryTable userStories={formData.userStories || []} onUpdate={stories => handleFormDataChange('userStories', stories)} />}
                  {formData.type === TaskType.BugReport && <BugReportTable bugReports={formData.bugReports || []} onUpdate={reports => handleFormDataChange('bugReports', reports)} />}
                  {formData.type === TaskType.FeatureRequest && <FeatureRequestTable featureRequests={formData.featureRequests || []} onUpdate={requests => handleFormDataChange('featureRequests', requests)} allUniqueStakeholders={allUniqueStakeholders} user={user} />}
                  {formData.type === TaskType.Stakeholder && <StakeholderTable stakeholders={formData.stakeholders || []} onUpdate={stakeholders => handleFormDataChange('stakeholders', stakeholders)} onEditPhoto={handleStakeholderPhotoEdit} allUniqueStakeholders={allUniqueStakeholders} />}

                  <div>
                    <h3 className="text-sm font-bold uppercase mb-2 text-light-text/70 dark:text-dark-text/70">Attachments</h3>
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`p-3 border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-brand-primary bg-brand-secondary/10' : 'border-light-shadow-2/50 dark:border-dark-shadow-1/50'}`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(formData.attachments || []).map(att => (
                          <div key={att.id} className="relative group p-2 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm">
                            <div onClick={() => onPreviewAttachment(att)} className="flex items-center space-x-2 cursor-pointer truncate">
                              <PaperclipIcon className="h-4 w-4 flex-shrink-0" /> <span className="text-xs truncate">{att.name}</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveAttachment(att.id)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon className="h-2.5 w-2.5" /></button>
                          </div>
                        ))}
                      </div>
                      <label htmlFor="file-upload" className="mt-2 block text-xs text-center cursor-pointer text-brand-primary font-semibold">Click to upload or drag files here</label>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                    </div>
                  </div>

                  {task && (
                    <div>
                      <h3 className="text-sm font-bold uppercase mb-2 text-light-text/70 dark:text-dark-text/70">Activity</h3>
                      {aiSummary && <div className="p-3 mb-3 rounded-lg bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset text-xs prose dark:prose-invert max-w-full" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\n/g, '<br />') }} />}
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {(formData.comments || []).map(comment => (
                          <div key={comment.id} className="flex items-start space-x-2">
                            <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-6 w-6 rounded-full" />
                            <div className="flex-1 p-2 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset">
                              <p className="text-xs font-semibold">{comment.author.name} <span className="font-normal opacity-60 ml-1">{new Date(comment.createdAt).toLocaleString()}</span></p>
                              <p className="text-xs mt-0.5">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className={`${NeumorphicInput} flex-grow`} onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                        <button type="button" onClick={handleAddComment} disabled={!newComment.trim()} className={NeumorphicActionButton}>Send</button>
                        <button type="button" onClick={handleSummarize} disabled={isSummarizing || !formData.comments?.length} className={NeumorphicActionButton}>{isSummarizing ? <SpinnerIcon/> : <SparklesIcon className="text-brand-primary h-3 w-3" />}<span className="ml-1">Summarize</span></button>
                        <button type="button" onClick={handleUpdateDescription} disabled={isUpdatingDesc || !formData.comments?.length} className={NeumorphicActionButton}>{isUpdatingDesc ? <SpinnerIcon/> : <SparklesIcon className="text-brand-primary h-3 w-3" />}<span className="ml-1">Update Desc</span></button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-3 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80 flex-shrink-0 bg-light-bg dark:bg-dark-bg z-10 rounded-b-2xl">
              <button type="submit" className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200 text-sm">{task ? 'Save Changes' : 'Create Task'}</button>
              <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 rounded-xl font-semibold shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
      {isCropperOpen && <ImageCropperModal isOpen={isCropperOpen} onClose={() => setIsCropperOpen(false)} onSave={handleStakeholderPhotoSave} />}
    </>
  );
};

export default TaskModal;
