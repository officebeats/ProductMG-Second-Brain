
import * as React from 'react';
import type { FeatureRequestEntry, Stakeholder, User, Comment } from '../../types';
import { analyzeFeatureRequest } from '../../services/geminiService';
import { TrashIcon, SparklesIcon, SpinnerIcon, ThumbsUpIcon } from '../icons/Icons';

interface FeatureRequestTableProps {
    featureRequests: FeatureRequestEntry[];
    onUpdate: (requests: FeatureRequestEntry[]) => void;
    allUniqueStakeholders: Stakeholder[];
    user: User;
}

const AutoGrowTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const autoGrow = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    React.useEffect(() => {
        autoGrow();
    }, [props.value]);

    return <textarea ref={textareaRef} {...props} rows={1} onInput={autoGrow} className={`${props.className} resize-none overflow-hidden`} />;
};

export const FeatureRequestTable: React.FC<FeatureRequestTableProps> = ({ featureRequests, onUpdate, allUniqueStakeholders, user }) => {
    const [analyzingId, setAnalyzingId] = React.useState<string | null>(null);
    const [expandedCommentsId, setExpandedCommentsId] = React.useState<string | null>(null);
    const [newCommentText, setNewCommentText] = React.useState<{ [key: string]: string }>({});

    const handleAdd = () => {
        const newRequest: FeatureRequestEntry = { id: `fr-${Date.now()}`, requestorName: '', rawRequest: '', upvotes: [], comments: [] };
        onUpdate([...featureRequests, newRequest]);
    };

    const handleChange = (index: number, field: keyof FeatureRequestEntry, value: any) => {
        const newRequests = [...featureRequests];
        newRequests[index] = { ...newRequests[index], [field]: value };

        // Auto-fill role if stakeholder name matches
        if (field === 'requestorName') {
            const matchedStakeholder = allUniqueStakeholders.find(sh => sh.name === value);
            if (matchedStakeholder && matchedStakeholder.role) {
                newRequests[index].requestorRole = matchedStakeholder.role;
            }
        }
        onUpdate(newRequests);
    };

    const handleRemove = (id: string) => {
        onUpdate(featureRequests.filter(fr => fr.id !== id));
    };

    const handleAnalyze = async (index: number) => {
        const request = featureRequests[index];
        if (!request.rawRequest) return;
        
        setAnalyzingId(request.id);
        const analysis = await analyzeFeatureRequest(request.rawRequest);
        if (analysis) {
            handleChange(index, 'painPoint', analysis.painPoint);
            handleChange(index, 'businessContext', analysis.businessContext);
            handleChange(index, 'value', analysis.value);
        }
        setAnalyzingId(null);
    };

    const handleUpvote = (index: number) => {
        const newRequests = [...featureRequests];
        const request = newRequests[index];
        const upvotes = request.upvotes || [];
        const userIndex = upvotes.findIndex(u => u.name === user.name);

        if (userIndex > -1) {
            upvotes.splice(userIndex, 1);
        } else {
            upvotes.push({ name: user.name, avatarUrl: user.avatarUrl });
        }
        handleChange(index, 'upvotes', upvotes);
    };
    
    const handleAddComment = (index: number) => {
        const request = featureRequests[index];
        const text = newCommentText[request.id]?.trim();
        if (!text) return;

        const newComment: Comment = {
            id: `frc-${Date.now()}`,
            author: { name: user.name, avatarUrl: user.avatarUrl },
            content: text,
            createdAt: new Date().toISOString(),
        };

        const comments = [...(request.comments || []), newComment];
        handleChange(index, 'comments', comments);
        setNewCommentText(prev => ({ ...prev, [request.id]: '' }));
    };


    const StandardTextarea = "w-full p-2.5 text-sm bg-light-bg dark:bg-dark-shadow-2 border border-light-shadow-2/30 dark:border-dark-shadow-1 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-light-text dark:text-dark-text";
    const NeumorphicActionButton = "flex items-center px-3 py-1 rounded-lg font-semibold text-sm shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Feature Requests</h3>
            <div className="space-y-4">
                {featureRequests.map((req, index) => (
                    <div key={req.id} className="p-4 rounded-lg border border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Requestor Name</label>
                                <input list="stakeholder-names" value={req.requestorName} onChange={(e) => handleChange(index, 'requestorName', e.target.value)} className={StandardTextarea} />
                                <datalist id="stakeholder-names">
                                    {allUniqueStakeholders.map(sh => <option key={sh.id} value={sh.name} />)}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Requestor Role</label>
                                <input type="text" value={req.requestorRole || ''} onChange={(e) => handleChange(index, 'requestorRole', e.target.value)} className={StandardTextarea} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Raw Request</label>
                            <AutoGrowTextarea value={req.rawRequest} onChange={(e) => handleChange(index, 'rawRequest', e.target.value)} className={StandardTextarea} rows={3} />
                        </div>
                        <div className="flex justify-end mt-2">
                             <button type="button" onClick={() => handleAnalyze(index)} disabled={!req.rawRequest || analyzingId === req.id} className={NeumorphicActionButton}>
                                {analyzingId === req.id ? <SpinnerIcon /> : <SparklesIcon className="text-brand-primary" />}
                                <span className="ml-1">Analyze</span>
                            </button>
                        </div>
                        {(req.painPoint || req.businessContext || req.value) && (
                            <div className="mt-4 p-3 rounded-md bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset space-y-2 text-sm">
                                {req.painPoint && <div><strong className="font-semibold">Pain Point:</strong> {req.painPoint}</div>}
                                {req.businessContext && <div><strong className="font-semibold">Business Context:</strong> {req.businessContext}</div>}
                                {req.value && <div><strong className="font-semibold">Value:</strong> {req.value}</div>}
                            </div>
                        )}
                         <div className="flex items-center justify-between pt-2 mt-4 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                            <div className="flex items-center space-x-4">
                                <button type="button" onClick={() => handleUpvote(index)} className={`${NeumorphicActionButton} ${ (req.upvotes || []).some(u => u.name === user.name) ? 'text-brand-primary' : ''}`}>
                                    <ThumbsUpIcon isFilled={(req.upvotes || []).some(u => u.name === user.name)} /> <span className="ml-1.5 font-bold">{(req.upvotes || []).length}</span>
                                </button>
                                <button type="button" onClick={() => setExpandedCommentsId(prev => prev === req.id ? null : req.id)} className={NeumorphicActionButton}>
                                    <span>Comments ({(req.comments || []).length})</span>
                                </button>
                            </div>
                            <button type="button" onClick={() => handleRemove(req.id)} title="Delete feature request" className="p-2 rounded-full text-red-500 hover:bg-red-200/50 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                        {expandedCommentsId === req.id && (
                            <div className="mt-4 space-y-3 animate-fade-in" style={{animationDuration: '300ms'}}>
                                {(req.comments || []).map(comment => (
                                     <div key={comment.id} className="flex items-start space-x-3 text-sm">
                                        <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-6 w-6 rounded-full mt-1" />
                                        <div className="flex-1 p-2 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset">
                                        <p><span className="font-semibold">{comment.author.name}</span> <span className="text-xs opacity-60 ml-2">{new Date(comment.createdAt).toLocaleDateString()}</span></p>
                                        <p className="mt-1">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-start space-x-3">
                                     <img src={user.avatarUrl} alt={user.name} className="h-6 w-6 rounded-full mt-1" />
                                     <div className="flex-grow">
                                        <textarea 
                                            value={newCommentText[req.id] || ''}
                                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [req.id]: e.target.value}))}
                                            placeholder="Add a comment..."
                                            className="w-full text-sm p-2 rounded-md bg-light-bg dark:bg-dark-shadow-2 border border-light-shadow-2/30 dark:border-dark-shadow-1 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                            rows={2}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(index); }}}
                                        />
                                        <button onClick={() => handleAddComment(index)} className="mt-1 text-xs font-bold text-white bg-brand-primary px-3 py-1 rounded-md hover:opacity-90">Post</button>
                                     </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button type="button" onClick={handleAdd} className="text-sm font-semibold text-brand-primary">
                + Add Feature Request
            </button>
        </div>
    );
};