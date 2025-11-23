
import * as React from 'react';
import { CloseIcon, PlusIcon } from './icons/Icons';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

const CROP_SIZE = 256;

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ isOpen, onClose, onSave }) => {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);

  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [scale, setScale] = React.useState(1);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const drawCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the image
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.restore();

    // Draw the crop area overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    // Outer rectangle
    ctx.rect(0, 0, canvas.width, canvas.height);
    // Inner (hole) rectangle
    const holeX = (canvas.width - CROP_SIZE) / 2;
    const holeY = (canvas.height - CROP_SIZE) / 2;
    ctx.moveTo(holeX, holeY);
    ctx.lineTo(holeX + CROP_SIZE, holeY);
    ctx.lineTo(holeX + CROP_SIZE, holeY + CROP_SIZE);
    ctx.lineTo(holeX, holeY + CROP_SIZE);
    ctx.closePath();
    ctx.fill('evenodd');
    ctx.restore();
  }, [position, scale]);

  React.useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        // Center the image and scale it to fit
        const canvas = canvasRef.current;
        if (!canvas) return;
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let initialScale;
        if (imgAspect > canvasAspect) { // Image is wider
            initialScale = canvas.width / img.width;
        } else { // Image is taller
            initialScale = canvas.height / img.height;
        }
        setScale(initialScale);
        setPosition({
            x: (canvas.width - img.width * initialScale) / 2,
            y: (canvas.height - img.height * initialScale) / 2,
        });
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  React.useEffect(() => {
    if (canvasRef.current && imageRef.current) {
      drawCanvas();
    }
  }, [drawCanvas]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePaste = React.useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => setImageSrc(e.target?.result as string);
            reader.readAsDataURL(blob);
        }
        break;
      }
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('paste', handlePaste);
    }
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, handlePaste]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => setIsDragging(false);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = CROP_SIZE;
    tempCanvas.height = CROP_SIZE;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    const cropX = (canvas.width - CROP_SIZE) / 2;
    const cropY = (canvas.height - CROP_SIZE) / 2;

    ctx.drawImage(
      imageRef.current,
      (cropX - position.x) / scale,
      (cropY - position.y) / scale,
      CROP_SIZE / scale,
      CROP_SIZE / scale,
      0,
      0,
      CROP_SIZE,
      CROP_SIZE
    );
    onSave(tempCanvas.toDataURL('image/jpeg', 0.9));
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <div 
        className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark w-full max-w-lg flex flex-col animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 flex justify-between items-center border-b border-light-shadow-2/30 dark:border-dark-shadow-2/80">
          <h2 className="text-xl font-bold">Edit Photo</h2>
          <button onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>
        
        <div className="p-6">
            {!imageSrc ? (
                <div 
                    className="w-full h-64 border-2 border-dashed border-light-shadow-2/50 dark:border-dark-shadow-1/50 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-secondary/10 transition-colors"
                    onClick={triggerFileSelect}
                >
                    <PlusIcon />
                    <p className="font-semibold mt-2">Upload an image</p>
                    <p className="text-sm opacity-70">or paste from clipboard</p>
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    className="w-full h-auto rounded-lg cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />
            )}
             <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
        
        <div className="px-6 py-4 flex justify-between items-center border-t border-light-shadow-2/30 dark:border-dark-shadow-2/80">
           {imageSrc && <button type="button" onClick={triggerFileSelect} className="text-sm font-semibold text-brand-primary">Change Photo</button>}
          <div className="flex justify-end space-x-3 w-full">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl font-semibold shadow-neumorphic-light-sm dark:shadow-neumorphic-dark-sm hover:shadow-neumorphic-light-sm-inset dark:hover:shadow-neumorphic-dark-sm-inset focus:outline-none transition-all duration-200">Cancel</button>
            <button type="button" onClick={handleSave} disabled={!imageSrc} className="px-5 py-2 rounded-xl font-semibold bg-brand-primary text-white shadow-md hover:opacity-90 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">Save Photo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
