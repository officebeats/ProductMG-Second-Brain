import * as React from 'react';
import { CloseIcon, SparklesIcon, SpinnerIcon } from './icons/Icons';

interface IdeaInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
}

const IdeaInputModal: React.FC<IdeaInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [description, setDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDescription('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    await onSubmit(description);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div 
        className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-full max-w-lg flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
          <h2 className="text-xl font-bold flex items-center">
            <SparklesIcon className="mr-2 text-brand-primary" />
            New Idea
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all duration-200 shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="mb-4 text-sm text-light-text/80 dark:text-dark-text/80">
            Describe your idea or feature request. AI will automatically generate a title for you.
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 rounded-xl bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-200 resize-none"
            rows={5}
            placeholder="e.g. We need a way to export analytics reports as PDF because customers are asking for offline access..."
            autoFocus
            required
          />
          
          <div className="mt-6 flex justify-end space-x-3">
             <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2 rounded-xl font-semibold shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={isLoading || !description.trim()}
                className="flex items-center px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <SpinnerIcon /> : <SparklesIcon className="mr-2" />}
                {isLoading ? 'Generating Title...' : 'Create Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdeaInputModal;