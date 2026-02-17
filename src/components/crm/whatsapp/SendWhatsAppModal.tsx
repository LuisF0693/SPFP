import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { MessageCircle, AlertCircle } from 'lucide-react';
import { whatsappService } from '../../../services/whatsappService';

interface SendWhatsAppModalProps {
  isOpen: boolean;
  clientPhone: string;
  clientName: string;
  ataContent: string;
  onClose: () => void;
}

export const SendWhatsAppModal: React.FC<SendWhatsAppModalProps> = ({
  isOpen,
  clientPhone,
  clientName,
  ataContent,
  onClose,
}) => {
  const [phone, setPhone] = useState(clientPhone);
  const [error, setError] = useState<string | null>(null);

  const handleSend = () => {
    if (!whatsappService.validatePhone(phone)) {
      setError('Telefone inválido');
      return;
    }

    const text = whatsappService.formatTextForWhatsApp(ataContent);
    whatsappService.sendViaWhatsApp(phone, text);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar por WhatsApp"
      size="md"
      variant="dark"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-2">Telefone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+55 11 99999-9999"
            className="w-full glass p-3 rounded-lg border border-white/10 text-white"
          />
          <p className="text-xs text-gray-500 mt-1">Formato: +55 11 99999-9999</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-white/20 rounded-lg text-white font-semibold hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-3 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SendWhatsAppModal;
