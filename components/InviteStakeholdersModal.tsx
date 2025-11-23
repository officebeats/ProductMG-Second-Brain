import * as React from 'react';
import type { Stakeholder } from '../types';
import { CloseIcon, StakeholderIcon, LinkedInIcon, MagicIcon, SpinnerIcon } from './icons/Icons';
import { useAppContext } from '../context/AppContext';
import { getLinkedInProfileInfo } from '../services/geminiService';

interface InviteStakeholdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    allStakeholders: Stakeholder[];
    onInvite: (names: string[]) => void;
}

const InviteStakeholdersModal: React.FC<InviteStakeholdersModalProps> = ({ isOpen, onClose, allStakeholders, onInvite }) => {
    const { dispatch } = useAppContext();
    const [activeTab, setActiveTab] = React.useState<'existing' | 'new'>('existing');
    const [selectedNames, setSelectedNames] = React.useState<string[]>([]);
    const [justInvited, setJustInvited] = React.useState(false);

    // New Stakeholder State
    const [newStakeholderName, setNewStakeholderName] = React.useState('');
    const [newStakeholderRole, setNewStakeholderRole] = React.useState('');
    const [linkedInUrl, setLinkedInUrl] = React.useState('');
    const [isLoadingLinkedIn, setIsLoadingLinkedIn] = React.useState(false);
    const [newStakeholderAvatar, setNewStakeholderAvatar] = React.useState('');

    const uninvitedStakeholders = React.useMemo(() => {
        return allStakeholders.filter(sh => !sh.invited);
    }, [allStakeholders]);

    React.useEffect(() => {
        if (isOpen) {
            setSelectedNames([]);
            setJustInvited(false);
            setActiveTab('existing');
            resetNewForm();
        }
    }, [isOpen]);

    const resetNewForm = () => {
        setNewStakeholderName('');
        setNewStakeholderRole('');
        setLinkedInUrl('');
        setNewStakeholderAvatar('');
    };

    const handleToggleSelection = (name: string) => {
        setSelectedNames(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            setSelectedNames(uninvitedStakeholders.map(sh => sh.name));
        } else {
            setSelectedNames([]);
        }
    };

    const handleSendInvites = () => {
        if (selectedNames.length > 0) {
            onInvite(selectedNames);
            setJustInvited(true);
            setTimeout(() => {
                onClose();
            }, 2000); 
        }
    };

    const handleImportLinkedIn = async () => {
        if (!linkedInUrl) return;
        setIsLoadingLinkedIn(true);
        const data = await getLinkedInProfileInfo(linkedInUrl);
        if (data) {
            setNewStakeholderName(data.name);
            setNewStakeholderRole(data.role);
            setNewStakeholderAvatar(data.avatarData);
        }
        setIsLoadingLinkedIn(false);
    };

    const handleAddNewStakeholder = () => {
        if (!newStakeholderName.trim()) return;
        
        const newStakeholder: Stakeholder = {
            id: `sh-new-${Date.now()}`,
            name: newStakeholderName.trim(),
            role: newStakeholderRole.trim(),
            avatarData: newStakeholderAvatar,
            invited: false,
            linkedIn: linkedInUrl.trim(), // Save the LinkedIn URL
        };

        // Dispatch global action to add stakeholder
        dispatch({ type: 'ADD_STAKEHOLDER', payload: newStakeholder });
        
        // Switch to existing tab and select the new user
        resetNewForm();
        setActiveTab('existing');
        setSelectedNames(prev => [...prev, newStakeholder.name]);
    };

    if (!isOpen) return null;
    
    const NeumorphicInput = "w-full p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-2 focus:ring-brand-primary transition-shadow duration-200 text-sm";
    const allSelected = uninvitedStakeholders.length > 0 && selectedNames.length === uninvitedStakeholders.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-full max-w-md flex flex-col animate-fade-in max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 flex justify-between items-center border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                    <h2 className="text-xl font-bold">Invite Stakeholders</h2>
                    <button onClick={onClose} className="p-2 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset" aria-label="Close">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-light-bg dark:bg-dark-bg border-b border-light-shadow-2/20 dark:border-dark-shadow-2/50">
                    <button 
                        onClick={() => setActiveTab('existing')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'existing' ? 'bg-brand-primary text-white shadow-md' : 'text-light-text/70 dark:text-dark-text/70 hover:bg-brand-secondary/10'}`}
                    >
                        Select Existing
                    </button>
                    <button 
                        onClick={() => setActiveTab('new')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'new' ? 'bg-brand-primary text-white shadow-md' : 'text-light-text/70 dark:text-dark-text/70 hover:bg-brand-secondary/10'}`}
                    >
                        Add New
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto min-h-[300px]">
                    {activeTab === 'existing' ? (
                        <>
                            {justInvited ? (
                                <div className="text-center py-10">
                                    <h3 className="text-lg font-semibold text-brand-primary">Invitations Sent!</h3>
                                    <p className="mt-2">They will receive an email shortly with instructions to join.</p>
                                </div>
                            ) : uninvitedStakeholders.length === 0 ? (
                                <div className="text-center py-10">
                                    <h3 className="text-lg font-semibold">All Aboard!</h3>
                                    <p className="mt-2 opacity-70">All known stakeholders have already been invited.</p>
                                    <button onClick={() => setActiveTab('new')} className="mt-4 text-brand-primary font-bold text-sm hover:underline">Add a new one?</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-light-shadow-2/20 dark:border-dark-shadow-2/50">
                                        <span className="text-xs font-semibold uppercase opacity-70">{uninvitedStakeholders.length} Uninvited</span>
                                        <button 
                                            onClick={() => handleSelectAll(!allSelected)}
                                            className="text-xs font-bold text-brand-primary hover:underline"
                                        >
                                            {allSelected ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    {uninvitedStakeholders.map(sh => (
                                        <label key={sh.id} className="flex items-center p-3 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm cursor-pointer hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset transition-shadow">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                                checked={selectedNames.includes(sh.name)}
                                                onChange={() => handleToggleSelection(sh.name)}
                                            />
                                            <div className="ml-4 flex items-center">
                                                {sh.avatarData ? (
                                                    <img src={sh.avatarData} alt={sh.name} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                                                ) : (
                                                     <div className="h-10 w-10 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center">
                                                        <StakeholderIcon />
                                                    </div>
                                                )}
                                                <div className="ml-3">
                                                    <p className="font-semibold">{sh.name}</p>
                                                    {sh.role && <p className="text-sm opacity-70">{sh.role}</p>}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-5">
                            <div className="bg-light-bg dark:bg-dark-bg p-3 rounded-xl shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset">
                                <label className="block text-xs font-bold mb-2 uppercase text-brand-primary flex items-center">
                                    <LinkedInIcon className="mr-1 w-4 h-4"/> Import from LinkedIn
                                </label>
                                <div className="flex space-x-2">
                                    <input 
                                        type="text" 
                                        placeholder="Paste LinkedIn Profile URL" 
                                        className={NeumorphicInput}
                                        value={linkedInUrl}
                                        onChange={(e) => setLinkedInUrl(e.target.value)}
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleImportLinkedIn}
                                        disabled={isLoadingLinkedIn || !linkedInUrl}
                                        className="px-3 py-2 rounded-lg bg-brand-primary text-white shadow-md hover:opacity-90 disabled:opacity-50"
                                        title="Auto-fill from LinkedIn"
                                    >
                                        {isLoadingLinkedIn ? <SpinnerIcon /> : <MagicIcon />}
                                    </button>
                                </div>
                                <p className="text-[10px] mt-1 opacity-60 ml-1">AI will extract name and pull a profile picture.</p>
                            </div>

                            <div className="flex items-center space-x-4 justify-center py-2">
                                {newStakeholderAvatar ? (
                                    <img src={newStakeholderAvatar} alt="Preview" className="h-20 w-20 rounded-full object-cover shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm border-2 border-brand-primary" />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center border-2 border-dashed border-light-text/20">
                                        <span className="text-xs opacity-50">No Image</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase opacity-70">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Jane Doe" 
                                    className={NeumorphicInput}
                                    value={newStakeholderName}
                                    onChange={(e) => setNewStakeholderName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold mb-1 uppercase opacity-70">Role / Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. CTO" 
                                    className={NeumorphicInput}
                                    value={newStakeholderRole}
                                    onChange={(e) => setNewStakeholderRole(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 flex justify-end items-center space-x-3 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                    {activeTab === 'existing' ? (
                        <>
                            <span className="text-sm font-medium">{selectedNames.length} selected</span>
                            <button
                                onClick={handleSendInvites}
                                disabled={selectedNames.length === 0}
                                className="px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send Invites
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleAddNewStakeholder}
                            disabled={!newStakeholderName}
                            className="px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                        >
                            Add to List
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteStakeholdersModal;