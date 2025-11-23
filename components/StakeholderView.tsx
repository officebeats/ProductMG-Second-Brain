
import * as React from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, Stakeholder } from '../types';
import { TASK_TYPE_COLORS } from '../constants';
import { StakeholderIcon, RoleIcon, ListIcon, GridIcon, SearchIcon, LinkedInIcon } from './icons/Icons';
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
    const [searchQuery, setSearchQuery] = React.useState('');
    
    // View Mode State: 'list' | 'card'
    // Default to 'list', but check localStorage for user preference (making it their 'default')
    const [viewMode, setViewMode] = React.useState<'list' | 'card'>(() => {
        const savedMode = localStorage.getItem('stakeholderViewMode');
        return (savedMode === 'card' || savedMode === 'list') ? savedMode : 'list';
    });

    const handleViewModeChange = (mode: 'list' | 'card') => {
        setViewMode(mode);
        localStorage.setItem('stakeholderViewMode', mode);
    };


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

    const filteredStakeholders = React.useMemo(() => {
        if (!searchQuery) return stakeholdersWithTasks;
        const query = searchQuery.toLowerCase();
        return stakeholdersWithTasks.filter(({ stakeholder }) => 
            stakeholder.name.toLowerCase().includes(query) ||
            (stakeholder.role && stakeholder.role.toLowerCase().includes(query))
        );
    }, [stakeholdersWithTasks, searchQuery]);

    const handleSaveStakeholder = (originalName: string, updatedDetails: { name: string; role?: string, avatarData?: string, linkedIn?: string }) => {
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
    
    const handleTransferStakeholder = (fromName: string, toName: string) => {
        dispatch({
            type: 'TRANSFER_STAKEHOLDER',
            payload: { fromName, toName }
        });
        setEditingStakeholder(null);
    };
    
    const handleSelectTask = (task: Task) => {
        setEditingStakeholder(null);
        onEditTask(task);
    };

    const openLinkedIn = (e: React.MouseEvent, url?: string) => {
        e.stopPropagation();
        if (url) {
            window.open(url, '_blank');
        }
    }

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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 animate-fade-in">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex space-x-2 bg-light-bg dark:bg-dark-bg p-1 rounded-xl shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset shrink-0">
                        <button
                            onClick={() => handleViewModeChange('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-md' : 'text-light-text dark:text-dark-text hover:bg-brand-secondary/20'}`}
                            title="List View"
                        >
                            <ListIcon />
                        </button>
                        <button
                            onClick={() => handleViewModeChange('card')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'card' ? 'bg-brand-primary text-white shadow-md' : 'text-light-text dark:text-dark-text hover:bg-brand-secondary/20'}`}
                            title="Card View"
                        >
                            <GridIcon />
                        </button>
                    </div>
                    
                     <div className="relative flex-grow md:w-64">
                        <input 
                            type="text" 
                            placeholder="Search stakeholders..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2 pl-9 rounded-lg bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm transition-shadow"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-light-text/50 dark:text-dark-text/50">
                            <SearchIcon />
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl shadow-md hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
                >
                    Invite Stakeholders
                </button>
            </div>

            {filteredStakeholders.length === 0 ? (
                 <div className="text-center p-10 bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl animate-fade-in">
                    <p className="text-light-text/70 dark:text-dark-text/70">
                        No stakeholders match your search.
                    </p>
                </div>
            ) : (
                <>
                {viewMode === 'card' ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-fade-in">
                        {filteredStakeholders.map(({ stakeholder, tasks }) => (
                            <div 
                                key={stakeholder.id} 
                                className="bg-light-bg dark:bg-dark-bg p-3 rounded-xl shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset cursor-pointer transition-all duration-200"
                                onClick={() => setEditingStakeholder({ stakeholder, tasks })}
                            >
                                <div className="mb-3 flex items-center space-x-3">
                                    {stakeholder.avatarData ? (
                                        <img src={stakeholder.avatarData} alt={stakeholder.name} className="h-10 w-10 rounded-full object-cover shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm" loading="lazy" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center">
                                            <StakeholderIcon />
                                        </div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold truncate mr-2">
                                                {stakeholder.name}
                                                <span className="text-xs font-normal opacity-60 ml-1">({tasks.length})</span>
                                            </h3>
                                            {stakeholder.invited && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-medium">Invited</span>
                                            )}
                                        </div>
                                        <div className="flex items-center mt-0.5">
                                            {stakeholder.role && (
                                                <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset text-light-text/80 dark:text-dark-text/80 truncate max-w-[120px] mr-2">
                                                    <RoleIcon className="h-3 w-3 mr-1" />
                                                    <span className="truncate">{stakeholder.role}</span>
                                                </div>
                                            )}
                                            {stakeholder.linkedIn && (
                                                <button onClick={(e) => openLinkedIn(e, stakeholder.linkedIn)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors" title="View LinkedIn Profile">
                                                    <LinkedInIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
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
                ) : (
                    <div className="bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-inset dark:shadow-neumorphic-dark-inset rounded-2xl overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                 <thead className="text-xs uppercase whitespace-nowrap bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-[5]">
                                    <tr className="border-b border-light-shadow-2/50 dark:border-dark-shadow-1 text-light-text dark:text-dark-text">
                                        <th className="px-4 py-3 font-semibold">Name</th>
                                        <th className="px-4 py-3 font-semibold">Role</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Associated Tasks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStakeholders.map(({ stakeholder, tasks }) => (
                                        <tr 
                                            key={stakeholder.id}
                                            onClick={() => setEditingStakeholder({ stakeholder, tasks })}
                                            className="border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80 hover:bg-light-shadow-1/20 dark:hover:bg-dark-shadow-1/20 cursor-pointer transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                     {stakeholder.avatarData ? (
                                                        <img src={stakeholder.avatarData} alt={stakeholder.name} className="h-8 w-8 rounded-full object-cover shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm" loading="lazy" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-light-bg dark:bg-dark-shadow-2 shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset flex items-center justify-center">
                                                            <StakeholderIcon />
                                                        </div>
                                                    )}
                                                    <span className="font-medium whitespace-nowrap">
                                                        {stakeholder.name}
                                                        <span className="text-xs font-normal opacity-60 ml-2">({tasks.length})</span>
                                                    </span>
                                                    {stakeholder.linkedIn && (
                                                        <button onClick={(e) => openLinkedIn(e, stakeholder.linkedIn)} className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors" title="View LinkedIn Profile">
                                                            <LinkedInIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-light-text/80 dark:text-dark-text/80 whitespace-nowrap">
                                                {stakeholder.role || '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {stakeholder.invited ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Invited
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {tasks.map(task => (
                                                        <span 
                                                            key={task.id}
                                                            className={`px-2 py-0.5 rounded-[4px] text-[10px] font-medium ${TASK_TYPE_COLORS[task.type]} cursor-pointer hover:opacity-80 transition-opacity`}
                                                            onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                                                            title={task.title}
                                                        >
                                                            {task.title}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                </>
            )}
           
             {editingStakeholder && (
                <StakeholderDetailModal
                    stakeholderWithTasks={editingStakeholder}
                    allUniqueStakeholders={allUniqueStakeholders}
                    onClose={() => setEditingStakeholder(null)}
                    onSave={handleSaveStakeholder}
                    onTransfer={handleTransferStakeholder}
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
