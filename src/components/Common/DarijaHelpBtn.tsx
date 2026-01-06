import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { DARIJA_TTS_DICTIONARY } from '../../hooks/useDarijaNotify';

interface DarijaHelpBtnProps {
    messageKey: string;
    dictionary: Record<string, string>;
}

export default function DarijaHelpBtn({ messageKey, dictionary }: DarijaHelpBtnProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const message = dictionary[messageKey] || "Ma3louma ma moujouda lhad l'action.";

        toast.info(message, {
            style: {
                background: '#eff6ff',
                border: '1px solid #3b82f6',
                color: '#1e3a8a'
            },
            icon: <Info size={18} color="#3b82f6" />,
            action: {
                label: 'Sme3 🔊',
                onClick: () => {
                    // Stop any previous speech
                    window.speechSynthesis.cancel();

                    const utterance = new SpeechSynthesisUtterance(message);
                    utterance.lang = 'ar-MA'; // Try Moroccan Arabic, fallback to generic Arabic
                    utterance.rate = 0.9; // Slightly slower for clarity

                    // Try to pick an Arabic voice
                    const voices = window.speechSynthesis.getVoices();
                    const arabicVoice = voices.find(v => v.lang.includes('ar'));
                    if (arabicVoice) utterance.voice = arabicVoice;

                    window.speechSynthesis.speak(utterance);
                }
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            className="help-btn"
            style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: '8px',
                transition: 'all 0.2s ease'
            }}
            title="Chnou hada?"
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
        >
            <Info size={14} color="#3b82f6" />
        </button>
    );
}
