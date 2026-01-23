import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const [isDragOver, setIsDragOver] = useState(false);

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
        <div className="relative max-w-2xl mx-auto mt-12">
            {/* Background Glow */}
            <div className={`absolute -inset-4 bg-neon-purple/20 blur-3xl rounded-full transition-opacity duration-500 ${isDragOver ? 'opacity-100' : 'opacity-0'}`} />

            <div
                className={`relative glass-card p-12 text-center transition-all duration-300 group
          ${isDragOver ? 'border-neon-purple/50 scale-[1.02] neon-glow-purple' : 'border-white/5 hover:border-white/10'}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="hidden"
                    id="file-upload"
                    accept=".mp3,.wav,.srt"
                    onChange={handleChange}
                />

                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500
              ${isDragOver ? 'bg-neon-purple text-white' : 'bg-slate-800/50 text-slate-400 group-hover:text-neon-purple group-hover:bg-neon-purple/10'}
            `}>
                            <UploadIcon className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-semibold text-white">
                                Upload your Content
                            </h3>
                            <p className="text-slate-400 max-w-xs mx-auto">
                                Drag and drop your audio (.mp3, .wav) or subtitle (.srt) files to get started.
                            </p>
                        </div>

                        <div className={`px-6 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium transition-all
              ${isDragOver ? 'border-neon-purple/50 bg-neon-purple/10 text-neon-purple' : 'text-slate-400 group-hover:text-slate-200'}
            `}>
                            Browse Files
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
};
