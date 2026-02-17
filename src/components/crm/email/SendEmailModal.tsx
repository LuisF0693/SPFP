import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { emailService } from '../../../services/emailService';

interface SendEmailModalProps {
  isOpen: boolean;
  clientEmail: string;
  clientName: string;
  ataContent: string;
  ataType: 'reuniao' | 'investimentos';
  onClose: () => void;
  onSuccess?: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  clientEmail,
  clientName,
  ataContent,
  ataType,
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState(clientEmail);
  const [subject, setSubject] = useState('Ata');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setError('Email inválido');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const html = emailService.generateTemplate(ataContent, clientName);
      await emailService.send({
        to: email,
        subject,
        html,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar por Email"
      size="md"
      variant="dark"
    >
      {success ? (
        <div className="text-center py-8 space-y-4">
          <div className="text-4xl text-accent">✓</div>
          <p className="text-white font-semibold">Email enviado!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass p-3 rounded-lg border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Assunto</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
              className="w-full glass p-3 rounded-lg border border-white/10 text-white"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
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
              disabled={isSending}
              className="flex-1 py-3 bg-accent rounded-lg text-white font-semibold hover:bg-accent/80 disabled:opacity-50"
            >
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SendEmailModal;
