import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Transaction, TransactionType } from './types';
import TransactionList from './components/TransactionList';
import Summary from './components/Summary';
import TransactionModal from './components/TransactionModal';
import { PlusIcon } from './components/Icons';
import { supabase } from './services/supabaseClient';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // Initial check is done
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const fetchTransactions = async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('transacoes')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
          setError('Falha ao carregar transações. Verifique sua conexão e se a tabela `transacoes` está configurada corretamente com RLS.');
        } else {
          setTransactions(data as unknown as Transaction[]);
        }
        setLoading(false);
      };

      fetchTransactions();
    } else {
      // Clear transactions if user logs out
      setTransactions([]);
    }
  }, [session]);

  const handleAddTransaction = useCallback(async (newTxData: Omit<Transaction, 'id'>) => {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([newTxData])
      .select();

    if (error) {
      console.error('Error adding transaction:', error);
      alert('Não foi possível adicionar a transação.');
    } else if (data) {
      setTransactions(prev => [data[0] as unknown as Transaction, ...prev]);
    }
  }, []);

  const handleUpdateTransaction = useCallback(async (updatedTx: Transaction) => {
    const { id, ...updateData } = updatedTx;
    const { data, error } = await supabase
      .from('transacoes')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating transaction:', error);
      alert('Não foi possível atualizar a transação.');
    } else if (data) {
      setTransactions(prev =>
        prev.map(tx => (tx.id === id ? (data[0] as unknown as Transaction) : tx))
      );
    }
  }, []);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('transacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      alert('Não foi possível excluir a transação.');
    } else {
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    }
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const summary = transactions.reduce(
      (acc, tx) => {
        if (tx.type === TransactionType.INCOME) {
          acc.totalIncome += tx.amount;
        } else {
          acc.totalExpense += tx.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
    return { ...summary, balance: summary.totalIncome - summary.totalExpense };
  }, [transactions]);

  if (loading && !session) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900"><p className="text-gray-500 dark:text-gray-400">Carregando...</p></div>
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            Meu Gestor Financeiro
          </h1>
           <div className="flex items-center space-x-4">
              <span className="text-sm hidden sm:block text-gray-600 dark:text-gray-300">{session.user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-sm"
              >
                  Sair
              </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Summary income={totalIncome} expense={totalExpense} balance={balance} />
        <div className="mt-8">
            {loading && <p className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando transações...</p>}
            {error && (
              <div className="text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="text-xl font-semibold text-red-700 dark:text-red-300">Ocorreu um Erro</h3>
                <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            {!loading && !error && (
                <TransactionList
                transactions={transactions}
                onEdit={openEditModal}
                onDelete={handleDeleteTransaction}
                />
            )}
        </div>
      </main>
      
      <div className="fixed bottom-6 right-6">
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-110"
          aria-label="Adicionar nova transação"
        >
          <PlusIcon className="h-8 w-8" />
        </button>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAdd={handleAddTransaction}
        onUpdate={handleUpdateTransaction}
        existingTransaction={editingTransaction}
      />
    </div>
  );
};

export default App;
