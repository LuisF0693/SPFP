export interface UserFile {
  id: string;
  userId: string;
  name: string;
  category: 'investimentos' | 'planejamento' | 'educacional' | 'outros';
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
  isFavorite: boolean;
  createdAt: string;
}

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg'];
const MAX_FILE_SIZE = 10485760;

export const fileService = {
  validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo não suportado';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande';
    }

    return null;
  },

  categorizeFile(file: File): 'investimentos' | 'planejamento' | 'educacional' | 'outros' {
    const name = file.name.toLowerCase();

    if (name.includes('invest') || name.includes('acao') || name.includes('fii')) {
      return 'investimentos';
    }
    if (name.includes('planej') || name.includes('plan')) {
      return 'planejamento';
    }
    if (name.includes('educ') || name.includes('aula')) {
      return 'educacional';
    }

    return 'outros';
  },

  async uploadFile(file: File, userId: string): Promise<UserFile> {
    const error = this.validateFile(file);
    if (error) throw new Error(error);

    const category = this.categorizeFile(file);
    const timeStamp = new Date().getTime();
    const fileName = timeStamp + '-' + file.name;
    const storagePath = userId + '/' + category + '/' + fileName;

    const userFile: UserFile = {
      id: Math.random().toString(36),
      userId,
      name: file.name,
      category,
      storagePath,
      sizeBytes: file.size,
      mimeType: file.type,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('file_' + userFile.id, JSON.stringify(userFile));

    return userFile;
  },

  async getFiles(userId: string): Promise<UserFile[]> {
    const files: UserFile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('file_')) {
        const file = JSON.parse(localStorage.getItem(key) || '{}');
        if (file.userId === userId) {
          files.push(file);
        }
      }
    }
    return files;
  },

  async deleteFile(fileId: string): Promise<void> {
    localStorage.removeItem('file_' + fileId);
  },

  async toggleFavorite(fileId: string): Promise<void> {
    const key = 'file_' + fileId;
    const file = JSON.parse(localStorage.getItem(key) || '{}');
    file.isFavorite = !file.isFavorite;
    localStorage.setItem(key, JSON.stringify(file));
  },
};

export default fileService;
