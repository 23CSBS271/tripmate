import { useState, useEffect } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Plus, CheckCircle2, Circle, Edit2, Trash2, Filter, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const TaskList = ({ tripId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, taskId: null, taskTitle: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTasks();
  }, [tripId]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/trip/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const taskData = {
        ...formData,
        tripId: tripId,
        completed: false,
      };

      const method = editingTask ? 'PUT' : 'POST';
      const url = editingTask
        ? `${API_BASE_URL}/tasks/${editingTask._id}`
        : `${API_BASE_URL}/tasks`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) throw new Error('Failed to save task');

      setFormData({ title: '', description: '', due_date: new Date().toISOString().split('T')[0] });
      setShowForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      setErrorMessage('Failed to save task');
      setShowErrorModal(true);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !task.completed })
      });

      if (!response.ok) throw new Error('Failed to update task');

      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = (task) => {
    setDeleteConfirm({
      show: true,
      taskId: task._id,
      taskTitle: task.title
    });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tasks/${deleteConfirm.taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete task');

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-gray-600">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm transition shadow-sm ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                : 'bg-white border border-blue-200 text-gray-700 hover:bg-blue-50'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm transition shadow-sm ${
              filter === 'pending'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                : 'bg-white border border-blue-200 text-gray-700 hover:bg-blue-50'
            }`}
          >
            Pending ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg text-sm transition shadow-sm ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                : 'bg-white border border-blue-200 text-gray-700 hover:bg-blue-50'
            }`}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </button>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingTask(null);
              setFormData({ title: '', description: '', due_date: new Date().toISOString().split('T')[0] });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Task title"
            required
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Description (optional)"
            rows="2"
          />
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition shadow-md"
            >
              {editingTask ? 'Update' : 'Add'} Task
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingTask(null);
                setFormData({ title: '', description: '', due_date: new Date().toISOString().split('T')[0] });
              }}
              className="px-4 py-2 bg-white border border-blue-200 text-gray-700 rounded-lg hover:bg-blue-50 transition shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No tasks yet. Add your first task to get started!
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white border border-blue-200 rounded-lg p-4 flex items-start gap-3 shadow-sm ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => handleToggleComplete(task)}
                className="mt-1 text-gray-600 hover:text-blue-600 transition"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h4>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                {task.due_date && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-50 border border-blue-200 text-xs text-gray-700 rounded">
                    Due: {formatDate(task.due_date)}
                  </span>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  className="p-2 text-gray-600 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, taskId: null, taskTitle: '' })}
        onConfirm={confirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteConfirm.taskTitle}"? This action cannot be undone.`}
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
