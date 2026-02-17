import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { MaterialSelector } from './MaterialSelector';

interface MeetingMinutesFormProps {
  clientId: string;
  clientName: string;
  onSave?: (data: MeetingMinutesData) => void;
  onCancel?: () => void;
}

export interface MeetingMinutesData {
  clientId: string;
  clientName: string;
  meetingDate: string;
  nextMeetingDate: string;
  nextMeetingTime: string;
  topics: string[];
  pendingItems: string[];
  materials: string[];
}

export const MeetingMinutesForm: React.FC<MeetingMinutesFormProps> = ({
  clientId,
  clientName,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<MeetingMinutesData>({
    clientId,
    clientName,
    meetingDate: new Date().toISOString().split('T')[0],
    nextMeetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    nextMeetingTime: '14:00',
    topics: [''],
    pendingItems: [''],
    materials: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.meetingDate) newErrors.meetingDate = 'Data da reunião é obrigatória';
    if (!formData.nextMeetingDate) newErrors.nextMeetingDate = 'Data da próxima reunião é obrigatória';
    if (!formData.nextMeetingTime) newErrors.nextMeetingTime = 'Hora da próxima reunião é obrigatória';
    if (formData.topics.every(t => !t.trim())) newErrors.topics = 'Adicione pelo menos um tópico';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const cleanData = {
        ...formData,
        topics: formData.topics.filter(t => t.trim()),
        pendingItems: formData.pendingItems.filter(p => p.trim()),
      };
      
      localStorage.setItem(`meeting_minutes_${clientId}`, JSON.stringify(cleanData));
      onSave?.(cleanData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Client Info */}
      <div className="glass p-4 rounded-2xl border border-white/10">
        <p className="text-sm text-gray-400">Cliente</p>
        <p className="text-lg font-bold text-white">{clientName}</p>
      </div>

      {/* Meeting Date */}
      <div>
        <label className="block text-sm font-semibold text-white mb-2">Data da Reunião *</label>
        <input
          type="date"
          value={formData.meetingDate}
          onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
          className="w-full glass p-3 rounded-lg border border-white/10 text-white focus:border-accent focus:outline-none transition-colors"
        />
        {errors.meetingDate && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.meetingDate}
          </p>
        )}
      </div>

      {/* Next Meeting */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Próxima Reunião (Data) *</label>
          <input
            type="date"
            value={formData.nextMeetingDate}
            onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
            className="w-full glass p-3 rounded-lg border border-white/10 text-white focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Próxima Reunião (Hora) *</label>
          <input
            type="time"
            value={formData.nextMeetingTime}
            onChange={(e) => setFormData({ ...formData, nextMeetingTime: e.target.value })}
            className="w-full glass p-3 rounded-lg border border-white/10 text-white focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Topics */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">Tópicos Discutidos *</label>
        <RichTextEditor
          value={formData.topics}
          onChange={(topics) => setFormData({ ...formData, topics })}
          placeholder="Descreva os tópicos discutidos..."
          maxItems={10}
        />
        {errors.topics && (
          <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.topics}
          </p>
        )}
      </div>

      {/* Pending Items */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">Pontos Pendentes</label>
        <RichTextEditor
          value={formData.pendingItems}
          onChange={(pendingItems) => setFormData({ ...formData, pendingItems })}
          placeholder="Itens pendentes..."
          maxItems={10}
        />
      </div>

      {/* Materials */}
      <MaterialSelector
        value={formData.materials}
        onChange={(materials) => setFormData({ ...formData, materials })}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-3 bg-accent rounded-lg text-white font-semibold hover:bg-accent/80 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? 'Salvando...' : <><CheckCircle size={16} /> Salvar Rascunho</>}
        </button>
      </div>
    </div>
  );
};

export default MeetingMinutesForm;
