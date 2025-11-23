
import * as React from 'react';
import type { Stakeholder } from '../types';
import { CloseIcon, StakeholderIcon } from './icons/Icons';

interface InviteStakeholdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    allStakeholders: Stakeholder[];
    onInvite: (names: string[]) => void;
}

const InviteStakeholdersModal: React.FC<InviteStakeholdersModalProps> = ({ isOpen, onClose, allStakeholders, onInvite }) => {
    const [selectedNames, setSelectedNames] = React.useState<string[]>([]);
    const [justInvited, setJustInvited] = React.useState(false);

    const uninvitedStakeholders = React.useMemo(() => {
        return allStakeholders.filter(sh => !sh.invited);
    }, [allStakeholders]);

    React.useEffect(() => {
        if (isOpen) {
            setSelectedNames([]);
            setJustInvited(false);
        }
    }, [isOpen]);

    const handleToggleSelection = (name: string) => {
        setSelectedNames(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : [...prev, name]
        );
    };

    const handleSendInvites = () => {
        if (selectedNames.length > 0) {
            onInvite(selectedNames);
            setJustInvited(true);
            setTimeout(() => {
                onClose();
            }, 2000); // Close modal after 2 seconds
        }
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-full max-w-md flex flex-col animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 flex justify-between items-center border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                    <h2 className="text-xl font-bold">Invite Stakeholders</h2>
                    <button onClick={onClose} className="p-2 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset" aria-label="Close">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto min-h-[200px]">
                    {justInvited ? (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-semibold text-brand-primary">Invitations Sent!</h3>
                            <p className="mt-2">They will receive an email shortly with instructions to join.</p>
                        </div>
                    ) : uninvitedStakeholders.length === 0 ? (
                        <div className="text-center py-10">
                            <h3 className="text-lg font-semibold">All Aboard!</h3>
                            <p className="mt-2 opacity-70">All known stakeholders have already been invited.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
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
                                            <img src={sh.avatarData} alt={sh.name} className="h-10 w-10 rounded-full object-cover" />
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
                </div>

                {!justInvited && uninvitedStakeholders.length > 0 && (
                     <div className="px-6 py-4 flex justify-end items-center space-x-3 border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                        <span className="text-sm font-medium">{selectedNames.length} selected</span>
                        <button
                            onClick={handleSendInvites}
                            disabled={selectedNames.length === 0}
                            className="px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send Invites
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InviteStakeholdersModal;