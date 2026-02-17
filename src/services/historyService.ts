export interface SentAta {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  type: 'reuniao' | 'investimentos';
  channel: 'email' | 'whatsapp';
  content: string;
  recipient: string;
  sentAt: string;
  createdAt: string;
}

export const historyService = {
  async saveSent(ata: Omit<SentAta, 'id' | 'createdAt'>): Promise<SentAta> {
    const record: SentAta = {
      ...ata,
      id: Math.random().toString(36),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('sent_ata_' + record.id, JSON.stringify(record));

    return record;
  },

  async getSentAtas(clientId: string): Promise<SentAta[]> {
    const atas: SentAta[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sent_ata_')) {
        const ata = JSON.parse(localStorage.getItem(key) || '{}');
        if (ata.clientId === clientId) {
          atas.push(ata);
        }
      }
    }
    return atas.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  },

  async getAta(id: string): Promise<SentAta | null> {
    const data = localStorage.getItem('sent_ata_' + id);
    return data ? JSON.parse(data) : null;
  },
};

export default historyService;
