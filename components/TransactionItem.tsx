
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { PencilIcon, TrashIcon } from './Icons';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEdit, onDelete }) => {
  const { id, type, amount, date, description, category } = transaction;
  const isIncome = type === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-green-500' : 'text-red-500';
  const amountSign = isIncome ? '+' : '-';

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedAmount = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <li className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <div className="flex items-center space-x-4">
        <div className={`w-2 h-12 rounded-full ${isIncome ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{description}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{formattedDate}</span>
            <span className="font-bold">·</span>
            <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{category}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
        <p className={`text-xl font-bold ${amountColor}`}>{`${amountSign} ${formattedAmount}`}</p>
        <div className="flex items-center space-x-2 sm:ml-4">
          <button
            onClick={() => onEdit(transaction)}
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Editar transação"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Excluir transação"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default TransactionItem;
