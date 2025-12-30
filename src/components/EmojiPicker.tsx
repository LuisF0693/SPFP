import React from 'react';

const COMMON_EMOJIS = [
    '🏠', '🚗', '🏥', '🎓', '🛒', '🎉', '🍔', '🛍️', '📈', '🛡️', '☂️', '💰',
    '💵', '✈️', '🎮', '💡', '📱', '💻', '👶', '🐾', '💄', '💊', '🚌', '⛽',
    '💸', '💳', '🎁', '🔧', '🧹', '🧺', '💇', '🏋️', '🎬', '📚', '🍷', '🍺',
    '🍕', '🥐', '🥩', '🥦', '🍦', '🍰', '☕', '👶', '🍼', '🧸'
];

interface EmojiPickerProps {
    selectedEmoji: string;
    onSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ selectedEmoji, onSelect }) => {
    return (
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 max-h-[200px] overflow-y-auto">
            {COMMON_EMOJIS.map(emoji => (
                <button
                    key={emoji}
                    type="button"
                    onClick={() => onSelect(emoji)}
                    className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-colors ${selectedEmoji === emoji ? 'bg-white dark:bg-gray-700 shadow-sm ring-2 ring-accent' : ''}`}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};
