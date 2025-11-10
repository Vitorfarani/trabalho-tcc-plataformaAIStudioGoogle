
import React from 'react';
import { Transaction } from '../types';
import TransactionItem from './TransactionItem';
import { DocumentMagnifyingGlassIcon } from './Icons';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <DocumentMagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">Nenhuma transação encontrada</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Comece adicionando um ganho ou despesa.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-bold p-6 border-b border-gray-200 dark:border-gray-700">Histórico de Transações</h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} transaction={tx} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
