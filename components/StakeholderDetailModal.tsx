

import * as React from 'react';
import type { Task, Stakeholder } from '../types';
import type { StakeholderWithTasks } from './StakeholderView';
import { TASK_TYPE_COLORS } from '../constants';
import { CloseIcon, StakeholderIcon } from './icons/Icons';
import ImageCropperModal from './ImageCropperModal';

interface StakeholderDetailModalProps {
  stakeholderWithTasks: StakeholderWithTasks;
  onClose: () => void;
  onSave: (originalName: string, updatedDetails: { name: string; role?: string; avatarData?: string; }) => void;
  onSelectTask: (task: Task) => void;
}

const StakeholderDetailModal: React.FC<StakeholderDetailModalProps> = ({ stakeholderWithTasks, onClose, onSave, onSelectTask }) => {
  const { stakeholder, tasks } = stakeholderWithTasks;
  const [name, setName] = React.useState(stakeholder.name);
  const [role, setRole] = React.useState(stakeholder.role || '');
  const [avatarData, setAvatarData] = React.useState(stakeholder.avatarData || '');
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);


  React.useEffect(() => {
    setName(stakeholder.name);
    setRole(stakeholder.role || '');
    setAvatarData(stakeholder.avatarData || '');
  }, [stakeholder]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(stakeholder.name, { name: name.trim(), role: role.trim(), avatarData: avatarData });
    }
  };

  const handlePhotoSave = (dataUrl: string) => {
      setAvatarData(dataUrl);
      setIsCropperOpen(false);
  };

  const NeumorphicInput = "w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-200";
  const NeumorphicPrimaryButton = "px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200";

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
          <h2 className="text-xl font-bold">Edit Stakeholder</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-all duration-200 shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-grow p-6 space-y-6 overflow-y-auto">
          <div className="flex items-center space-x-4">
             <button type="button" onClick={() => setIsCropperOpen(true)} className="relative group flex-shrink-0">
                {avatarData ? (
                    <img src={avatarData} alt={name} className="h-20 w-20 rounded-full object-cover shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm" />
                ) : (
                    <div className="h-20 w-20 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center">
                        <StakeholderIcon />
                    </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                    Edit
                </div>
            </button>
            <div className="space-y-4 flex-grow">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={NeumorphicInput} />
                </div>
                 <div>
                  <label className="block text-sm font-medium mb-1">Role (Optional)</label>
                  <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={NeumorphicInput} />
                </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold my-4 text-lg">Associated Tasks ({tasks.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 rounded-lg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset p-4">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => onSelectTask(task)}
                  className="p-2 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset cursor-pointer transition-all duration-200"
                >
                  <p className="font-semibold text-sm truncate">{task.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${TASK_TYPE_COLORS[task.type]}`}>
                      {task.type}
                    </span>
                    <span className="text-xs text-light-text/60 dark:text-dark-text/60">{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end space-x-3 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2 rounded-xl font-semibold shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200"
          >
            Cancel
          </button>
           <button 
            type="button" 
            onClick={handleSave} 
            className={NeumorphicPrimaryButton}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
    {isCropperOpen && (
        <ImageCropperModal
            isOpen={isCropperOpen}
            onClose={() => setIsCropperOpen(false)}
            onSave={handlePhotoSave}
        />
    )}
    </>
  );
};

export default StakeholderDetailModal;
