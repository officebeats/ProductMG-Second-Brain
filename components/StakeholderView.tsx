import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, Stakeholder } from '../types';
import { TASK_TYPE_COLORS } from '../constants';
import { StakeholderIcon, RoleIcon } from './icons/Icons';
import StakeholderDetailModal from './StakeholderDetailModal';
import InviteStakeholdersModal from './InviteStakeholdersModal';


interface StakeholderViewProps {
    onEditTask: (task: Task) => void;
}

export interface StakeholderWithTasks {
    stakeholder: Stakeholder;
    tasks: Task[];
}

const StakeholderView: React.FC<StakeholderViewProps> = ({ onEditTask }) => {
    const { state, dispatch } = useAppContext();
    const [editingStakeholder, setEditingStakeholder] = React.useState<StakeholderWithTasks | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);


    const allUniqueStakeholders = React.useMemo(() => {
        const map = new Map<string, Stakeholder>();
        state.tasks.forEach(task => {
            task.stakeholders?.forEach(sh => {
                if (!map.has(sh.name)) {
                    map.set(sh.name, sh);
                }
            });
        });
        return Array.from(map.values());
    }, [state.tasks]);


    const stakeholdersWithTasks = React.useMemo(() => {
        const map = new Map<string, StakeholderWithTasks>();

        state.tasks.forEach(task => {
            if (task.stakeholders && task.stakeholders.length > 0) {
                task.stakeholders.forEach(sh => {
                    if (!map.has(sh.name)) {
                        map.set(sh.name, {
                            stakeholder: sh,
                            tasks: [],
                        });
                    }
                    map.get(sh.name)!.tasks.push(task);
                });
            }
        });

        return Array.from(map.values()).sort((a, b) => a.stakeholder.name.localeCompare(b.stakeholder.name));

    }, [state.tasks]);

    const handleSaveStakeholder = (originalName: string, updatedDetails: { name: string; role?: string, avatarData?: string }) => {
        dispatch({
            type: 'UPDATE_STAKEHOLDER',
            payload: { originalName, updatedStakeholder: updatedDetails }
        });
        setEditingStakeholder(null);
    };

    const handleSendInvites = (names: string[]) => {
        dispatch({ type: 'INVITE_STAKEHOLDERS', payload: names });
        setIsInviteModalOpen(false);
    };
    
    const handleSelectTask = (task: Task) => {
        setEditingStakeholder(null);
        onEditTask(task);
    };

    if (stakeholdersWithTasks.length === 0) {
        return (
            <div className="text-center p-10 bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl animate-fade-in">
                <StakeholderIcon />
                <h2 className="mt-4 text-xl font-semibold">No Stakeholders Found</h2>
                <p className="mt-2 text-light-text/70 dark:text-dark-text/70">
                    Add stakeholders to tasks with the type '{'Stakeholder Mgt'}' to see them here.
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-end mb-4 animate-fade-in">
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition-opacity text-sm"
                >
                    Invite Stakeholders
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-in">
                {stakeholdersWithTasks.map(({ stakeholder, tasks }) => (
                    <div 
                        key={stakeholder.id} 
                        className="bg-light-bg dark:bg-dark-bg p-3 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset cursor-pointer transition-all duration-200"
                        onClick={() => setEditingStakeholder({ stakeholder, tasks })}
                    >
                        <div className="mb-3 flex items-center space-x-3">
                             {stakeholder.avatarData ? (
                                <img src={stakeholder.avatarData} alt={stakeholder.name} className="h-10 w-10 rounded-full object-cover shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm" />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center">
                                    <StakeholderIcon />
                                </div>
                            )}
                            <div className="flex-grow min-w-0">
                                <h3 className="text-sm font-bold truncate">{stakeholder.name}</h3>
                                {stakeholder.role && (
                                    <div className="mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset text-light-text/80 dark:text-dark-text/80 truncate max-w-full">
                                        <RoleIcon className="h-3 w-3 mr-1" />
                                        <span className="truncate">{stakeholder.role}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <h4 className="font-semibold mb-1 text-xs opacity-80">Tasks ({tasks.length})</h4>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {tasks.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                    className="p-1.5 rounded-md bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset hover:shadow-neumorphic-light-sm dark:hover:shadow-neumorphic-dark-sm cursor-pointer transition-all duration-200"
                                >
                                    <p className="font-semibold text-xs truncate">{task.title}</p>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <span className={`px-1 py-0 rounded-[4px] text-[10px] font-medium ${TASK_TYPE_COLORS[task.type]}`}>
                                            {task.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
             {editingStakeholder && (
                <StakeholderDetailModal
                    stakeholderWithTasks={editingStakeholder}
                    onClose={() => setEditingStakeholder(null)}
                    onSave={handleSaveStakeholder}
                    onSelectTask={handleSelectTask}
                />
            )}
            <InviteStakeholdersModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                allStakeholders={allUniqueStakeholders}
                onInvite={handleSendInvites}
            />
        </>
    );
};

export default StakeholderView;