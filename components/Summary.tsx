
import React from 'react';

interface SummaryProps {
  income: number;
  expense: number;
  balance: number;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const SummaryCard: React.FC<{ title: string; value: number; colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex-1">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{formatCurrency(value)}</p>
    </div>
);

const Summary: React.FC<SummaryProps> = ({ income, expense, balance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <SummaryCard title="Ganhos" value={income} colorClass="text-green-500" />
      <SummaryCard title="Despesas" value={expense} colorClass="text-red-500" />
      <SummaryCard title="Saldo" value={balance} colorClass={balance >= 0 ? 'text-blue-500' : 'text-red-500'} />
    </div>
  );
};

export default Summary;
