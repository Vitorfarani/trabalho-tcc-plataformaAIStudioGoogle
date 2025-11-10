
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { CATEGORIES } from '../constants';
import { extractTransactionDetailsFromImage } from '../services/geminiService';
import { CameraIcon, ArrowPathIcon, XMarkIcon } from './Icons';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate: (transaction: Transaction) => void;
  existingTransaction: Transaction | null;
}

const today = () => new Date().toISOString().split('T')[0];

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onAdd, onUpdate, existingTransaction }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(today());
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>(CATEGORIES[0]);
  const [error, setError] = useState<string>('');
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrMessage, setOcrMessage] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingTransaction) {
      setType(existingTransaction.type);
      setAmount(String(existingTransaction.amount));
      setDate(existingTransaction.date);
      setDescription(existingTransaction.description);
      setCategory(existingTransaction.category);
    } else {
      // Reset form for new transaction
      setType(TransactionType.EXPENSE);
      setAmount('');
      setDate(today());
      setDescription('');
      setCategory(TransactionCategory.FOOD);
    }
    setError('');
    setOcrMessage('');
  }, [existingTransaction, isOpen]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrMessage('Analisando seu recibo...');
    setError('');
    try {
      const details = await extractTransactionDetailsFromImage(file);
      if (details.amount) setAmount(String(details.amount));
      if (details.date) setDate(details.date);
      if (details.description) setDescription(details.description);
      setOcrMessage('Detalhes extraídos! Por favor, revise e salve.');
    } catch (err: any) {
      setError(err.message || 'Falha ao analisar o recibo.');
      setOcrMessage('');
    } finally {
      setOcrLoading(false);
      // Reset file input to allow selecting the same file again
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !date) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('O valor deve ser um número positivo.');
      return;
    }

    const transactionData = {
      type,
      amount: numericAmount,
      date,
      description,
      category,
    };
    
    if (existingTransaction) {
      onUpdate({ ...transactionData, id: existingTransaction.id });
    } else {
      onAdd(transactionData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <XMarkIcon className="h-6 w-6" />
        </button>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {existingTransaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          
          {/* OCR Section */}
          <div className="mb-4">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="receipt-upload" />
              <label htmlFor="receipt-upload" className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  {ocrLoading ? <ArrowPathIcon className="h-6 w-6 animate-spin text-indigo-500" /> : <CameraIcon className="h-6 w-6 text-indigo-500" />}
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{ocrLoading ? 'Processando...' : 'Carregar Recibo com OCR'}</span>
              </label>
              {ocrMessage && <p className="text-sm text-center mt-2 text-green-600 dark:text-green-400">{ocrMessage}</p>}
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`p-3 rounded-md text-center font-semibold transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Despesa</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`p-3 rounded-md text-center font-semibold transition-colors ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Ganho</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor (R$)</label>
              <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} step="0.01" placeholder="0,00" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Almoço no restaurante" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700" />
          </div>
          
          <div className="mt-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoria</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value as TransactionCategory)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          
          <div className="mt-8 flex justify-end">
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              {existingTransaction ? 'Salvar Alterações' : 'Adicionar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
