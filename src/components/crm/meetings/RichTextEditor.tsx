import React, { useState } from 'react';
import { Bold, Italic, List, Smile, Plus, Minus } from 'lucide-react';

interface RichTextEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
}

const EMOJI_PICKER = ['😊', '👍', '📈', '💼', '🎯', '📊', '💡', '✅', '📌', '⚠️', '🔔', '📅'];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Digite os tópicos discutidos...',
  maxItems = 20,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const addTopic = () => {
    if (value.length < maxItems) {
      onChange([...value, '']);
    }
  };

  const removeTopic = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const updateTopic = (idx: number, newValue: string) => {
    const updated = [...value];
    updated[idx] = newValue;
    onChange(updated);
  };

  const addEmoji = (emoji: string, idx: number) => {
    updateTopic(idx, value[idx] + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="space-y-4">
      {value.map((topic, idx) => (
        <div key={idx} className="glass rounded-2xl border border-white/10 p-4 space-y-3 group">
          <textarea
            value={topic}
            onChange={(e) => updateTopic(idx, e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:border-accent focus:outline-none transition-colors text-sm"
            rows={3}
          />

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Bold">
                <Bold size={14} />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Italic">
                <Italic size={14} />
              </button>
              <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Lista">
                <List size={14} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Emojis"
                >
                  <Smile size={14} />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 glass p-2 rounded-lg border border-white/10 grid grid-cols-6 gap-1 w-48 z-50">
                    {EMOJI_PICKER.map((e) => (
                      <button
                        key={e}
                        onClick={() => addEmoji(e, idx)}
                        className="p-2 hover:bg-white/10 rounded text-xl"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => removeTopic(idx)}
              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
              title="Remover tópico"
            >
              <Minus size={14} />
            </button>
          </div>
        </div>
      ))}

      {value.length < maxItems && (
        <button
          onClick={addTopic}
          className="w-full py-3 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:border-accent transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          <Plus size={18} />
          Adicionar Tópico
        </button>
      )}
    </div>
  );
};

export default RichTextEditor;
