
import * as React from 'react';
import type { Attachment } from '../types';
import { CloseIcon, PaperclipIcon } from './icons/Icons';

interface AttachmentPreviewModalProps {
  attachment: Attachment;
  onClose: () => void;
}

const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({ attachment, onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in" 
        onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-dark-bg rounded-lg shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <button 
            onClick={onClose}
            className="absolute -top-4 -right-4 text-white bg-brand-primary rounded-full p-2 z-10"
            aria-label="Close preview"
        >
            <CloseIcon />
        </button>

        {attachment.type.startsWith('image/') ? (
          <img 
            src={attachment.data} 
            alt={attachment.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-white">
            <PaperclipIcon className="h-16 w-16" />
            <h3 className="text-xl font-bold mt-4">{attachment.name}</h3>
            <p className="mt-2">Preview is not available for this file type.</p>
            <a 
                href={attachment.data} 
                download={attachment.name}
                className="mt-6 px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
                Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentPreviewModal;