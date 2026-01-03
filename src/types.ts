
export type TransactionType = 'INCOME' | 'EXPENSE';

export type AccountType = 'CHECKING' | 'INVESTMENT' | 'CASH' | 'CREDIT_CARD';

export type AccountOwner = 'ME' | 'SPOUSE' | 'JOINT';

export type CategoryGroup = 'FIXED' | 'VARIABLE' | 'INVESTMENT' | 'INCOME';

export type CardNetwork = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'OTHER';
// Exporting CategoryIconName helper type if needed, or just string. 
// Assuming CategoryIconName matches the keys in CategoryIcon component, roughly:
export type CategoryIconName = 'cart' | 'travel' | 'home' | 'car' | 'gift' | 'game' | 'health' | 'edu' | 'tech' | string;

export interface DashboardWidget {
  id: string;
  visible: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  hasChildren: boolean;
  children: ChildProfile[];
  hasSpouse: boolean;
  spouseName: string;
  spouseCpf: string;
  spouseEmail: string;
  spouseAvatar?: string;
  dashboardLayout?: DashboardWidget[];
  avatar?: string;
  theme?: 'dark' | 'light';
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  owner: AccountOwner;
  balance: number;
  creditLimit?: number;
  color?: string; // Cor de fundo do cartão
  lastFourDigits?: string;
  network?: CardNetwork;
  closingDay?: number;
  dueDay?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  group: CategoryGroup;
  icon?: string; // Nome do ícone (chave do mapa de ícones)
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  value: number;
  date: string;
  type: TransactionType;
  categoryId: string;
  paid: boolean; // Se foi pago ou não
  spender?: string; // Quem fez a compra (ID ou 'ME'/'SPOUSE')
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  icon?: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
}

export interface FinanceContextType {
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addManyTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  getAccountBalance: (accountId: string) => number;
  totalBalance: number;
}
