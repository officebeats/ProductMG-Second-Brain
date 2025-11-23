
import * as React from 'react';
import type { Task, Stakeholder } from '../types';
import type { StakeholderWithTasks } from './StakeholderView';
import { TASK_TYPE_COLORS } from '../constants';
import { CloseIcon, StakeholderIcon, LinkedInIcon, MagicIcon, SpinnerIcon, ExportIcon } from './icons/Icons';
import ImageCropperModal from './ImageCropperModal';
import { getLinkedInProfileInfo } from '../services/geminiService';

interface StakeholderDetailModalProps {
  stakeholderWithTasks: StakeholderWithTasks;
  allUniqueStakeholders: Stakeholder[];
  onClose: () => void;
  onSave: (originalName: string, updatedDetails: { name: string; role?: string; avatarData?: string; linkedIn?: string }) => void;
  onTransfer: (fromName: string, toName: string) => void;
  onSelectTask: (task: Task) => void;
}

const StakeholderDetailModal: React.FC<StakeholderDetailModalProps> = ({ stakeholderWithTasks, allUniqueStakeholders, onClose, onSave, onTransfer, onSelectTask }) => {
  const { stakeholder, tasks } = stakeholderWithTasks;
  const [name, setName] = React.useState(stakeholder.name);
  const [role, setRole] = React.useState(stakeholder.role || '');
  const [avatarData, setAvatarData] = React.useState(stakeholder.avatarData || '');
  const [linkedIn, setLinkedIn] = React.useState(stakeholder.linkedIn || '');
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = React.useState(false);
  const [transferTarget, setTransferTarget] = React.useState('');
  const [showTransferConfirm, setShowTransferConfirm] = React.useState(false);


  React.useEffect(() => {
    setName(stakeholder.name);
    setRole(stakeholder.role || '');
    setAvatarData(stakeholder.avatarData || '');
    setLinkedIn(stakeholder.linkedIn || '');
    setTransferTarget('');
    setShowTransferConfirm(false);
  }, [stakeholder]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(stakeholder.name, { name: name.trim(), role: role.trim(), avatarData: avatarData, linkedIn: linkedIn.trim() });
    }
  };

  const handlePhotoSave = (dataUrl: string) => {
      setAvatarData(dataUrl);
      setIsCropperOpen(false);
  };

  const handleImportLinkedIn = async () => {
      if (!linkedIn) return;
      setIsLoadingLinkedIn(true);
      const data = await getLinkedInProfileInfo(linkedIn);
      if (data) {
          setName(data.name);
          setRole(data.role);
          setAvatarData(data.avatarData);
      }
      setIsLoadingLinkedIn(false);
  };

  const openLinkedIn = () => {
      if (linkedIn) {
          window.open(linkedIn, '_blank');
      }
  };

  const handleExecuteTransfer = () => {
      if (transferTarget && transferTarget !== stakeholder.name) {
          if (window.confirm(`Are you sure you want to move all ${tasks.length} tasks from ${stakeholder.name} to ${transferTarget}? This will effectively replace the stakeholder on these tasks.`)) {
              onTransfer(stakeholder.name, transferTarget);
          }
      }
  };

  const NeumorphicInput = "w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-200";
  const NeumorphicPrimaryButton = "px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200";

  // Filter out current stakeholder from potential transfer targets
  const potentialTargets = allUniqueStakeholders.filter(s => s.name !== stakeholder.name);

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
          <div className="flex items-start space-x-4">
             <button type="button" onClick={() => setIsCropperOpen(true)} className="relative group flex-shrink-0 mt-1">
                {avatarData ? (
                    <img src={avatarData} alt={name} className="h-24 w-24 rounded-full object-cover shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm" loading="lazy" />
                ) : (
                    <div className="h-24 w-24 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center">
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
                <div>
                    <label className="block text-sm font-medium mb-1 flex items-center"><LinkedInIcon className="w-3 h-3 mr-1"/> LinkedIn Profile</label>
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            value={linkedIn} 
                            onChange={(e) => setLinkedIn(e.target.value)} 
                            placeholder="https://linkedin.com/in/..." 
                            className={NeumorphicInput} 
                        />
                        <button 
                            type="button"
                            onClick={handleImportLinkedIn}
                            disabled={isLoadingLinkedIn || !linkedIn}
                            className="px-3 py-2 rounded-lg bg-brand-primary text-white shadow-md hover:opacity-90 disabled:opacity-50"
                            title="Auto-fill details from LinkedIn"
                        >
                            {isLoadingLinkedIn ? <SpinnerIcon /> : <MagicIcon />}
                        </button>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] opacity-60">Auto-fill extracts name & simulates a picture.</p>
                        {linkedIn && (
                            <button type="button" onClick={openLinkedIn} className="text-xs text-blue-600 hover:underline">Visit Profile</button>
                        )}
                    </div>
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

          <div className="pt-4 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
              <button 
                type="button" 
                onClick={() => setShowTransferConfirm(!showTransferConfirm)}
                className="text-sm font-semibold text-brand-primary flex items-center"
              >
                  <ExportIcon className="w-4 h-4 mr-2" /> Transfer Tasks to Another Stakeholder
              </button>
              
              {showTransferConfirm && (
                  <div className="mt-3 p-4 bg-brand-secondary/10 rounded-xl animate-fade-in">
                      <label className="block text-xs font-bold mb-2 uppercase">Transfer To:</label>
                      <div className="flex gap-2">
                          <select 
                            className={NeumorphicInput}
                            value={transferTarget}
                            onChange={(e) => setTransferTarget(e.target.value)}
                          >
                              <option value="">Select Stakeholder...</option>
                              {potentialTargets.map(s => (
                                  <option key={s.id} value={s.name}>{s.name} {s.role ? `(${s.role})` : ''}</option>
                              ))}
                          </select>
                          <button 
                            type="button" 
                            onClick={handleExecuteTransfer}
                            disabled={!transferTarget}
                            className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                          >
                              Transfer
                          </button>
                      </div>
                      <p className="text-xs mt-2 opacity-70">
                          Moves all {tasks.length} associated tasks to the selected stakeholder. 
                          The current stakeholder will be removed from those tasks.
                      </p>
                  </div>
              )}
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
