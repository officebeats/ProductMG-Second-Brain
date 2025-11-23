
import * as React from 'react';
import type { Stakeholder } from '../../types';
import { TrashIcon, StakeholderIcon } from '../icons/Icons';

interface StakeholderTableProps {
    stakeholders: Stakeholder[];
    onUpdate: (stakeholders: Stakeholder[]) => void;
    onEditPhoto: (index: number) => void;
    allUniqueStakeholders: Stakeholder[];
}

export const StakeholderTable: React.FC<StakeholderTableProps> = ({ stakeholders, onUpdate, onEditPhoto, allUniqueStakeholders }) => {

    const handleAdd = () => {
        const newStakeholder: Stakeholder = { id: `sh-${Date.now()}`, name: '', role: '' };
        onUpdate([...stakeholders, newStakeholder]);
    };

    const handleChange = (index: number, field: keyof Omit<Stakeholder, 'id' | 'avatarData'>, value: string) => {
        const newStakeholders = [...stakeholders];
        const currentStakeholder = { ...newStakeholders[index], [field]: value };
        
        // If name changed, check against existing stakeholders to autofill details
        if (field === 'name') {
            const existingStakeholder = allUniqueStakeholders.find(s => s.name === value);
            if (existingStakeholder) {
                currentStakeholder.role = existingStakeholder.role || '';
                currentStakeholder.avatarData = existingStakeholder.avatarData;
            }
        }
        
        newStakeholders[index] = currentStakeholder;
        onUpdate(newStakeholders);
    };

    const handleRemove = (id: string) => {
        onUpdate(stakeholders.filter(sh => sh.id !== id));
    };

    const StandardInput = "w-full p-2.5 text-sm bg-light-bg dark:bg-dark-shadow-2 border border-light-shadow-2/30 dark:border-dark-shadow-1 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-light-text dark:text-dark-text";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stakeholders</h3>
            <div className="space-y-4">
                {stakeholders.map((sh, index) => (
                    <div key={sh.id} className="flex items-center space-x-4 p-3 rounded-lg border border-light-shadow-2/30 dark:border-dark-shadow-2/80">
                        <button type="button" onClick={() => onEditPhoto(index)} className="relative group flex-shrink-0">
                            {sh.avatarData ? (
                                <img src={sh.avatarData} alt={sh.name} className="h-12 w-12 rounded-full object-cover shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center">
                                    <StakeholderIcon />
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                                Edit
                            </div>
                        </button>
                        <div className="flex-grow grid grid-cols-2 gap-4">
                            <input type="text" value={sh.name} onChange={(e) => handleChange(index, 'name', e.target.value)} placeholder="Stakeholder Name" className={StandardInput} list="stakeholder-names" />
                            <input type="text" value={sh.role || ''} onChange={(e) => handleChange(index, 'role', e.target.value)} placeholder="Role (e.g., CEO)" className={StandardInput} />
                        </div>
                        <button type="button" onClick={() => handleRemove(sh.id)} className="p-2 rounded-full text-red-500 hover:bg-red-200/50 transition-colors">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
            <datalist id="stakeholder-names">
                {allUniqueStakeholders.map(sh => <option key={sh.id} value={sh.name} />)}
            </datalist>
            <button type="button" onClick={handleAdd} className="text-sm font-semibold text-brand-primary">
                + Add Stakeholder
            </button>
        </div>
    );
};
