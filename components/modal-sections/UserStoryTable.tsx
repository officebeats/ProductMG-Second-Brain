import * as React from 'react';
import type { UserStory } from '../../types';
import { TrashIcon, CopyIcon } from '../icons/Icons';

interface UserStoryTableProps {
    userStories: UserStory[];
    onUpdate: (userStories: UserStory[]) => void;
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

export const UserStoryTable: React.FC<UserStoryTableProps> = ({ userStories, onUpdate }) => {
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    const handleAdd = () => {
        const newUserStory: UserStory = { id: `us-${Date.now()}`, title: '', story: '', acceptanceCriteria: '' };
        onUpdate([...userStories, newUserStory]);
    };

    const handleChange = (index: number, field: keyof UserStory, value: string) => {
        const newUserStories = [...userStories];
        newUserStories[index] = { ...newUserStories[index], [field]: value };
        onUpdate(newUserStories);
    };

    const handleRemove = (id: string) => {
        onUpdate(userStories.filter(us => us.id !== id));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const formatStoryForCopy = (story: UserStory): string => `Title: ${story.title}\n\nUser Story:\n${story.story}\n\nAcceptance Criteria:\n${story.acceptanceCriteria}`;
    const handleCopyIndividual = (story: UserStory) => copyToClipboard(formatStoryForCopy(story), story.id);

    const StandardTextarea = "w-full p-2.5 text-sm bg-light-bg dark:bg-dark-shadow-2 border border-light-shadow-2/30 dark:border-dark-shadow-1 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-light-text dark:text-dark-text";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Stories</h3>
            <div className="border border-light-shadow-2/30 dark:border-dark-shadow-2/80 rounded-xl">
                <div className="max-h-96 md:max-h-[none] overflow-y-auto relative">
                    {/* Render User Stories Here */}
                    <div className="space-y-4 p-2">
                        {userStories.map((story, index) => (
                            <div key={story.id} className="p-4 rounded-lg border border-light-shadow-2/30 dark:border-dark-shadow-2/80 relative">
                                <div className="space-y-3">
                                    <div><label className="block text-sm font-medium mb-1">Title</label><AutoGrowTextarea value={story.title} onChange={(e) => handleChange(index, 'title', e.target.value)} className={StandardTextarea} placeholder="Story Title"/></div>
                                    <div><label className="block text-sm font-medium mb-1">User Story</label><AutoGrowTextarea value={story.story} onChange={(e) => handleChange(index, 'story', e.target.value)} className={StandardTextarea} placeholder="As a [user type]..."/></div>
                                    <div><label className="block text-sm font-medium mb-1">Acceptance Criteria</label><AutoGrowTextarea value={story.acceptanceCriteria} onChange={(e) => handleChange(index, 'acceptanceCriteria', e.target.value)} className={StandardTextarea} placeholder="- Given [context]..."/></div>
                                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                                        <button type="button" onClick={() => handleCopyIndividual(story)} title={copiedId === story.id ? 'Copied!' : 'Copy story'} className="flex items-center text-xs p-1 rounded hover:bg-brand-secondary/20 transition-colors"><CopyIcon className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => handleRemove(story.id)} title="Delete story" className="flex items-center text-xs p-1 rounded text-red-500 hover:bg-red-200/50 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button type="button" onClick={handleAdd} className="text-sm font-semibold text-brand-primary">
                + Add User Story
            </button>
        </div>
    );
};
