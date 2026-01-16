import React from 'react';
import { Sparkles, X, Lightbulb } from 'lucide-react';

interface InsightModalProps {
    content: string;
    onClose: () => void;
    isOpen: boolean;
    theme: any;
}

const InsightModal: React.FC<InsightModalProps> = ({ content, onClose, isOpen, theme }) => {
    if (!isOpen) return null;

    // Function to format the content
    const formatContent = (text: string) => {
        // Split by newlines
        const lines = text.split('\n').filter(line => line.trim() !== '');

        return lines.map((line, idx) => {
            // Check for numbered list (e.g., "1. ", "2. ")
            const isNumbered = /^\d+\./.test(line);
            // Check for "Kesimpulan"
            const isConclusion = line.toLowerCase().includes('kesimpulan') || line.toLowerCase().includes('rekomendasi');

            if (isConclusion) {
                return (
                    <div key={idx} className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <h4 className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2 mb-1">
                            <Lightbulb size={16} /> Kesimpulan & Rekomendasi
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 pl-6">
                            {line.replace(/^(kesimpulan|rekomendasi)[:\s]*/i, '')}
                        </p>
                    </div>
                );
            }

            if (isNumbered) {
                return (
                    <div key={idx} className="flex gap-3 mb-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold mt-0.5">
                            {line.split('.')[0]}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                            {line.replace(/^\d+\.\s*/, '')}
                        </p>
                    </div>
                );
            }

            // Normal paragraph
            return (
                <p key={idx} className="text-sm text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                    {line.replace(/\*\*/g, '')} {/* Remove bold markdown if present for cleaner look */}
                </p>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border ${theme?.border || 'border-slate-200'}`}>

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Sparkles size={20} className="text-yellow-300" /> Analisis AI
                            </h3>
                            <p className="text-xs text-indigo-100 mt-1 opacity-90">Powered by Google Gemini 2.0 Flash</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Background Decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -ml-10 -mb-5"></div>
                </div>

                {/* Content Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {formatContent(content)}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        Tutup Analisis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InsightModal;
