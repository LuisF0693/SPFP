import React, { useState } from 'react';
import { X, Calendar, Mail, MessageCircle, FileText, History, TrendingUp } from 'lucide-react';
import { useCRM } from '@/hooks/crm/useCRM';
import { MeetingNotes } from './MeetingNotes';
import { ClientFiles } from './ClientFiles';
import { MeetingMinutesModal } from './meetings/MeetingMinutesModal';
import { InvestmentMinutesForm } from './investments/InvestmentMinutesForm';
import { SendEmailModal } from './email/SendEmailModal';
import { SendWhatsAppModal } from './whatsapp/SendWhatsAppModal';
import { HistoryTab } from './history/HistoryTab';

interface ClientDetailModalProps {
  isOpen: boolean;
  clientId: string;
  onClose: () => void;
}

type TabType = 'profile' | 'reuniao' | 'investimento' | 'email' | 'whatsapp' | 'arquivos' | 'historico';

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  clientId,
  onClose,
}) => {
  const { clients } = useCRM();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [ataContent, setAtaContent] = useState('');

  const client = clients.find(c => c.id === clientId);

  if (!isOpen || !client) return null;

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'profile', label: 'Perfil', icon: <TrendingUp size={18} /> },
    { id: 'reuniao', label: 'Atas Reunião', icon: <Calendar size={18} /> },
    { id: 'investimento', label: 'Atas Investimento', icon: <TrendingUp size={18} /> },
    { id: 'email', label: 'Email', icon: <Mail size={18} /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={18} /> },
    { id: 'arquivos', label: 'Arquivos', icon: <FileText size={18} /> },
    { id: 'historico', label: 'Histórico', icon: <History size={18} /> },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-bold text-white">{client.name}</h2>
              <p className="text-sm text-gray-400 mt-1">{client.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pt-4 border-b border-white/10 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white mb-3">Contato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Email</p>
                      <p className="text-white font-medium">{client.email}</p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Telefone</p>
                      <p className="text-white font-medium">{client.phone || 'Não informado'}</p>
                    </div>
                    {client.CPF && (
                      <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-1">CPF</p>
                        <p className="text-white font-medium">{client.CPF}</p>
                      </div>
                    )}
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Health Score</p>
                      <p className="text-lg font-bold text-accent">{client.healthScore}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white mb-3">Informações Financeiras</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Patrimônio</p>
                      <p className="text-lg font-bold text-accent">
                        R$ {(client.patrimony || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Perfil de Investimento</p>
                      <p className="text-lg font-bold text-blue-400 capitalize">{client.profile}</p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {client.notes && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white">Anotações</h3>
                    <p className="text-gray-300 text-sm">{client.notes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reuniao' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="px-4 py-2 bg-accent rounded-lg text-white font-medium hover:bg-accent/80"
                >
                  + Nova Ata de Reunião
                </button>
                <MeetingNotes clientId={clientId} />
              </div>
            )}

            {activeTab === 'investimento' && (
              <div className="space-y-4">
                <InvestmentMinutesForm
                  clientId={clientId}
                  clientName={client.name}
                  onSave={() => {}}
                  onCancel={onClose}
                />
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-accent rounded-lg text-white font-medium hover:bg-accent/80"
                >
                  + Enviar Email
                </button>
                <p className="text-gray-400">Envie atas de reunião ou investimento por email</p>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700"
                >
                  + Enviar WhatsApp
                </button>
                <p className="text-gray-400">Envie atas por WhatsApp</p>
              </div>
            )}

            {activeTab === 'arquivos' && (
              <ClientFiles clientId={clientId} />
            )}

            {activeTab === 'historico' && (
              <HistoryTab clientId={clientId} />
            )}
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      <MeetingMinutesModal
        isOpen={showMeetingModal}
        clientId={clientId}
        clientName={client.name}
        onClose={() => setShowMeetingModal(false)}
        onSave={(data) => {
          setAtaContent(JSON.stringify(data));
        }}
      />

      <SendEmailModal
        isOpen={showEmailModal}
        clientEmail={client.email}
        clientName={client.name}
        ataContent={ataContent}
        ataType="reuniao"
        onClose={() => setShowEmailModal(false)}
      />

      <SendWhatsAppModal
        isOpen={showWhatsAppModal}
        clientPhone={client.phone}
        clientName={client.name}
        ataContent={ataContent}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </>
  );
};
