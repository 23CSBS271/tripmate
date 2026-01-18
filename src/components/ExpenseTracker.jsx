import { useState, useEffect } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { DollarSign, Plus, Trash2, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CATEGORIES = ['Transport', 'Hotel', 'Food', 'Activities', 'Shopping', 'Other'];

export const ExpenseTracker = ({ tripId, budget }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, expenseId: null, expenseDescription: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    category: 'Transport',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchExpenses();
  }, [tripId]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/expenses/trip/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const expenseData = {
        ...formData,
        tripId: tripId
      };
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) throw new Error('Failed to add expense');

      setFormData({
        category: 'Transport',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      setErrorMessage('Failed to add expense');
      setShowErrorModal(true);
    }
  };

  const handleDelete = (expense) => {
    setDeleteConfirm({
      show: true,
      expenseId: expense._id,
      expenseDescription: expense.description || `${expense.category} - $${expense.amount}`
    });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/expenses/${deleteConfirm.expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete expense');

      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  const remaining = budget - totalSpent;
  const percentSpent = budget > 0 ? (totalSpent / budget) * 100 : 0;

  if (loading) {
    return <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-md">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Budget Tracker
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {budget > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Spent</span>
            <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${totalSpent.toFixed(2)} / ${budget}
            </span>
          </div>
          <div className="w-full bg-blue-50 rounded-full h-2 overflow-hidden border border-blue-100">
            <div
              className={`h-full transition-all ${
                percentSpent > 100 ? 'bg-red-500' : percentSpent > 80 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            />
          </div>
          <div className="text-center mt-2">
            <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {remaining >= 0 ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over budget`}
            </span>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Amount"
            step="0.01"
            min="0"
            required
          />
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description"
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition text-sm shadow-md"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-2 bg-white border border-blue-200 text-gray-700 rounded-lg hover:bg-blue-50 transition text-sm shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {expenses.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-4">No expenses yet</p>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-900 font-medium">${parseFloat(expense.amount).toFixed(2)}</span>
                  <span className="text-xs text-gray-600">{expense.category}</span>
                </div>
                {expense.description && (
                  <p className="text-sm text-gray-600">{expense.description}</p>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(expense.date).toLocaleDateString()}
                </span>
              </div>
              <button
                onClick={() => handleDelete(expense)}
                className="ml-3 p-1 text-gray-600 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, expenseId: null, expenseDescription: '' })}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteConfirm.expenseDescription}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmStyle="danger"
      />

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 rounded-full p-3 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowErrorModal(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
