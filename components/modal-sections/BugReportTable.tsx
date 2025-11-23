import * as React from 'react';
import type { BugReportEntry } from '../../types';
import { TrashIcon, CopyIcon } from '../icons/Icons';

interface BugReportTableProps {
    bugReports: BugReportEntry[];
    onUpdate: (bugReports: BugReportEntry[]) => void;
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

export const BugReportTable: React.FC<BugReportTableProps> = ({ bugReports, onUpdate }) => {
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    const handleAdd = () => {
        const newBugReport: BugReportEntry = { id: `br-${Date.now()}`, title: '', currentBehavior: '', expectedBehavior: '' };
        onUpdate([...bugReports, newBugReport]);
    };

    const handleChange = (index: number, field: keyof BugReportEntry, value: string) => {
        const newBugReports = [...bugReports];
        newBugReports[index] = { ...newBugReports[index], [field]: value };
        onUpdate(newBugReports);
    };

    const handleRemove = (id: string) => {
        onUpdate(bugReports.filter(br => br.id !== id));
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const formatBugForCopy = (bug: BugReportEntry): string => `Title: ${bug.title}\n\nCurrent Behavior:\n${bug.currentBehavior}\n\nExpected Behavior:\n${bug.expectedBehavior}`;
    const handleCopyIndividual = (bug: BugReportEntry) => copyToClipboard(formatBugForCopy(bug), bug.id);

    const StandardTextarea = "w-full p-2.5 text-sm bg-light-bg dark:bg-dark-shadow-2 border border-light-shadow-2/30 dark:border-dark-shadow-1 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-light-text dark:text-dark-text";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bug Reports</h3>
            <div className="border border-light-shadow-2/30 dark:border-dark-shadow-2/80 rounded-xl">
                 <div className="max-h-96 md:max-h-[none] overflow-y-auto relative">
                     <div className="space-y-4 p-2">
                        {bugReports.map((bug, index) => (
                            <div key={bug.id} className="p-4 rounded-lg border border-light-shadow-2/30 dark:border-dark-shadow-2/80 relative">
                                <div className="space-y-3">
                                    <div><label className="block text-sm font-medium mb-1">Title</label><AutoGrowTextarea value={bug.title} onChange={(e) => handleChange(index, 'title', e.target.value)} className={StandardTextarea} placeholder="Summary of the bug"/></div>
                                    <div><label className="block text-sm font-medium mb-1">Current Behavior</label><AutoGrowTextarea value={bug.currentBehavior} onChange={(e) => handleChange(index, 'currentBehavior', e.target.value)} className={StandardTextarea} placeholder="What is happening now?"/></div>
                                    <div><label className="block text-sm font-medium mb-1">Expected Behavior</label><AutoGrowTextarea value={bug.expectedBehavior} onChange={(e) => handleChange(index, 'expectedBehavior', e.target.value)} className={StandardTextarea} placeholder="What should be happening?"/></div>
                                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                                        <button type="button" onClick={() => handleCopyIndividual(bug)} title={copiedId === bug.id ? 'Copied!' : 'Copy bug report'} className="flex items-center text-xs p-1 rounded hover:bg-brand-secondary/20 transition-colors"><CopyIcon className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => handleRemove(bug.id)} title="Delete bug report" className="flex items-center text-xs p-1 rounded text-red-500 hover:bg-red-200/50 transition-colors"><TrashIcon className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <button type="button" onClick={handleAdd} className="text-sm font-semibold text-brand-primary">
                + Add Bug Report
            </button>
        </div>
    );
};
