
import * as React from 'react';

interface NeumorphicCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
    title?: string;
}

const NeumorphicCheckbox: React.FC<NeumorphicCheckboxProps> = ({ checked, onChange, className = '', title }) => {
    return (
        <div 
            className={`relative inline-block w-5 h-5 cursor-pointer ${className}`} 
            onClick={(e) => {
                e.stopPropagation();
                onChange(!checked);
            }}
            title={title}
        >
            <div className={`w-full h-full rounded-md transition-all duration-200 flex items-center justify-center
                ${checked 
                    ? 'bg-brand-primary shadow-inner' 
                    : 'bg-light-bg dark:bg-dark-bg shadow-neumorphic-light-sm-inset dark:shadow-neumorphic-dark-sm-inset hover:shadow-neumorphic-light-sm dark:hover:shadow-neumorphic-dark-sm'
                }
            `}>
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default NeumorphicCheckbox;
