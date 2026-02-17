import React, { useState, useEffect } from 'react';
import { X, Calendar, Mail, MessageCircle, FileText, History, TrendingUp, User, Phone, DollarSign } from 'lucide-react';
import { useCRM } from '@/hooks/crm/useCRM';
import { ClientEntry, calculateHealthScore } from '@/utils/crmUtils';
import { MeetingNotes } from './MeetingNotes';
import { ClientFiles } from './ClientFiles';
import { MeetingMinutesModal } from './meetings/MeetingMinutesModal';
import { InvestmentMinutesForm } from './investments/InvestmentMinutesForm';
import { SendEmailModal } from './email/SendEmailModal';
import { SendWhatsAppModal } from './whatsapp/SendWhatsAppModal';
import { HistoryTab } from './history/HistoryTab';

interface UnifiedClientModalProps {
  isOpen: boolean;
  clientEntry: ClientEntry | null;
  onClose: () => void;
}

type TabType = 'profile' | 'reuniao' | 'investimento' | 'email' | 'whatsapp' | 'arquivos' | 'historico';

/**
 * UnifiedClientModal - Modal unificado que funciona com ClientEntry (usuários da plataforma)
 * Integra todas as features de CRM (Atas, Email, WhatsApp, Arquivos, etc) em um único lugar
 */
export const UnifiedClientModal: React.FC<UnifiedClientModalProps> = ({
  isOpen,
  clientEntry,
  onClose,
}) => {
  const { clients, loadMeetingNotes, loadClientFiles } = useCRM();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [ataContent, setAtaContent] = useState('');
  const [crmClientId, setCrmClientId] = useState<string | null>(null);

  // Extrair dados do ClientEntry
  const userProfile = clientEntry?.content?.userProfile || {};
  const accounts = clientEntry?.content?.accounts || [];
  const transactions = clientEntry?.content?.transactions || [];
  const healthScore = clientEntry ? calculateHealthScore(clientEntry) : 0;
  const patrimony = accounts.reduce((sum, acc: any) => sum + (acc.balance || 0), 0);

  // Tentar encontrar o Cliente CRM correspondente por userId
  useEffect(() => {
    if (clientEntry && clients.length > 0) {
      const crmClient = clients.find(c => c.userId === clientEntry.user_id);
      if (crmClient) {
        setCrmClientId(crmClient.id);
        loadMeetingNotes(crmClient.id);
        loadClientFiles(crmClient.id);
      }
    }
  }, [clientEntry, clients, loadMeetingNotes, loadClientFiles]);

  if (!isOpen || !clientEntry) return null;

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'profile', label: 'Perfil', icon: <User size={18} /> },
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
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-slate-800 to-transparent">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{userProfile.name || 'Cliente'}</h2>
              <p className="text-sm text-gray-400 mt-1">{userProfile.email}</p>
            </div>
            <div className="text-right mr-6">
              <div className="text-3xl font-bold text-accent">{healthScore}</div>
              <p className="text-xs text-gray-400">Health Score</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-6 pt-4 border-b border-white/10 overflow-x-auto bg-slate-800/50">
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
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <User size={18} className="text-accent" />
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Email</p>
                      <p className="text-white font-medium truncate">{userProfile.email}</p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        <Phone size={12} /> Telefone
                      </p>
                      <p className="text-white font-medium">{userProfile.phone || '-'}</p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">CPF</p>
                      <p className="text-white font-medium">{userProfile.cpf || '-'}</p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Health Score</p>
                      <p className="text-lg font-bold text-accent">{healthScore}%</p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <DollarSign size={18} className="text-accent" />
                    Informações Financeiras
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Patrimônio Total</p>
                      <p className="text-lg font-bold text-accent">
                        R$ {patrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Contas</p>
                      <p className="text-lg font-bold text-white">{accounts.length}</p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Últimas Transações</p>
                      <p className="text-lg font-bold text-white">{transactions.slice(0, 10).length}</p>
                    </div>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-1">Último Acesso</p>
                      <p className="text-sm font-medium text-white">
                        {new Date(clientEntry.last_updated).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reuniao' && crmClientId && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowMeetingModal(true)}
                  className="px-4 py-2 bg-accent rounded-lg text-white font-medium hover:bg-accent/80 transition-colors"
                >
                  + Nova Ata de Reunião
                </button>
                <MeetingNotes clientId={crmClientId} />
              </div>
            )}

            {activeTab === 'investimento' && crmClientId && (
              <div className="space-y-4">
                <InvestmentMinutesForm
                  clientId={crmClientId}
                  clientName={userProfile.name || 'Cliente'}
                  onSave={() => {}}
                  onCancel={onClose}
                />
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-4">
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-accent rounded-lg text-white font-medium hover:bg-accent/80 transition-colors"
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
                  className="px-4 py-2 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 transition-colors"
                >
                  + Enviar WhatsApp
                </button>
                <p className="text-gray-400">Envie atas por WhatsApp</p>
              </div>
            )}

            {activeTab === 'arquivos' && crmClientId && (
              <ClientFiles clientId={crmClientId} />
            )}

            {activeTab === 'historico' && crmClientId && (
              <HistoryTab clientId={crmClientId} />
            )}
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      {crmClientId && (
        <>
          <MeetingMinutesModal
            isOpen={showMeetingModal}
            clientId={crmClientId}
            clientName={userProfile.name || 'Cliente'}
            onClose={() => setShowMeetingModal(false)}
            onSave={(data) => {
              setAtaContent(JSON.stringify(data));
            }}
          />

          <SendEmailModal
            isOpen={showEmailModal}
            clientEmail={userProfile.email || ''}
            clientName={userProfile.name || 'Cliente'}
            ataContent={ataContent}
            ataType="reuniao"
            onClose={() => setShowEmailModal(false)}
          />

          <SendWhatsAppModal
            isOpen={showWhatsAppModal}
            clientPhone={userProfile.phone || ''}
            clientName={userProfile.name || 'Cliente'}
            ataContent={ataContent}
            onClose={() => setShowWhatsAppModal(false)}
          />
        </>
      )}
    </>
  );
};
