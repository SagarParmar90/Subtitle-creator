import React, { useCallback, useState, useRef } from 'react';
import { Upload, Music, FileText } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [glowPosition, setGlowPosition] = useState({ x: '50%', y: '50%' });
    const [transform, setTransform] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = (mouseY / (rect.height / 2)) * -4;
        const rotateY = (mouseX / (rect.width / 2)) * 4;

        const glowX = ((e.clientX - rect.left) / rect.width) * 100;
        const glowY = ((e.clientY - rect.top) / rect.height) * 100;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`);
        setGlowPosition({ x: `${glowX}%`, y: `${glowY}%` });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
        setGlowPosition({ x: '50%', y: '50%' });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
    }, [onFileSelect]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="relative max-w-2xl mx-auto">
            {/* Ambient glow behind the upload area */}
            <div 
                className={`absolute -inset-8 rounded-[40px] transition-all duration-500 ${
                    isDragOver 
                        ? 'bg-gradient-to-r from-[#BF5AF2]/30 via-[#007AFF]/30 to-[#5AC8FA]/30 blur-3xl opacity-100' 
                        : 'bg-gradient-to-r from-[#BF5AF2]/10 to-[#007AFF]/10 blur-3xl opacity-50'
                }`} 
            />

            <div
                ref={ref}
                className={`
                    relative liquid-glass p-10 md:p-14 text-center cursor-pointer group
                    ${isDragOver ? 'border-[#007AFF]/50 !bg-[#007AFF]/5' : ''}
                `}
                style={{
                    transform,
                    transition: 'transform 0.15s ease-out'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-testid="file-upload-zone"
            >
                {/* Cursor-following glow */}
                <div 
                    className="absolute inset-0 pointer-events-none rounded-[inherit]"
                    style={{
                        background: `radial-gradient(500px circle at ${glowPosition.x} ${glowPosition.y}, rgba(191, 90, 242, 0.12) 0%, transparent 50%)`,
                        opacity: isDragOver ? 0 : 1,
                        transition: 'opacity 0.3s ease'
                    }}
                />

                <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".mp3,.wav,.srt"
                    onChange={handleChange}
                    data-testid="file-input"
                />

                <label htmlFor="file-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-7">
                        {/* Icon container */}
                        <div 
                            className={`
                                w-20 h-20 rounded-[22px] flex items-center justify-center
                                transition-all duration-300
                                ${isDragOver 
                                    ? 'bg-gradient-to-br from-[#007AFF] to-[#5AC8FA] shadow-lg shadow-[#007AFF]/30 scale-110' 
                                    : 'bg-white/5 group-hover:bg-gradient-to-br group-hover:from-[#BF5AF2]/20 group-hover:to-[#007AFF]/20'
                                }
                            `}
                        >
                            <Upload 
                                className={`w-9 h-9 transition-all duration-300 ${
                                    isDragOver ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                                }`} 
                            />
                        </div>

                        {/* Text content */}
                        <div className="space-y-3">
                            <h3 className="text-2xl font-semibold text-white">
                                {isDragOver ? 'Drop to Upload' : 'Upload your Content'}
                            </h3>
                            <p className="text-white/40 max-w-sm mx-auto leading-relaxed">
                                Drag and drop your audio or subtitle files to get started with AI transcription.
                            </p>
                        </div>

                        {/* File type badges */}
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <Music className="w-4 h-4 text-[#BF5AF2]" />
                                <span className="text-sm text-white/60">.mp3, .wav</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                <FileText className="w-4 h-4 text-[#007AFF]" />
                                <span className="text-sm text-white/60">.srt</span>
                            </div>
                        </div>

                        {/* Browse button */}
                        <div 
                            className={`
                                mt-2 px-6 py-3 rounded-full font-semibold text-sm
                                transition-all duration-300
                                ${isDragOver 
                                    ? 'bg-[#007AFF] text-white' 
                                    : 'bg-white/10 border border-white/15 text-white/70 group-hover:bg-white/15 group-hover:text-white'
                                }
                            `}
                        >
                            Browse Files
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
};
