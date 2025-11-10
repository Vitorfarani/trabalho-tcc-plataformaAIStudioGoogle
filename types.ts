
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum TransactionCategory {
  FOOD = 'Alimentação',
  TRANSPORT = 'Transporte',
  HOUSING = 'Moradia',
  BILLS = 'Contas',
  LEISURE = 'Lazer',
  HEALTH = 'Saúde',
  SALARY = 'Salário',
  OTHER = 'Outros',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  category: TransactionCategory;
}
