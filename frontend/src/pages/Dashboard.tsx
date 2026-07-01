import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { TaskForm } from '../components/TaskForm';
import { showToast } from '../components/Toast';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string | null;
  ownerId: string;
  owner: { id: string; email: string };
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await api.tasks.list();
    if (res.success && res.data) {
      setTasks(res.data as Task[]);
    } else if (!res.success) {
      setError(res.message || 'Failed to load tasks');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    const res = await api.tasks.delete(id);
    if (res.success) {
      showToast('success', 'Task deleted');
      fetchTasks();
    } else {
      showToast('error', res.message || 'Failed to delete');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = (date: string | null, status: string) => {
    if (!date || status === 'done') return false;
    return new Date(date) < new Date();
  };

  if (!user) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Tasks</h1>
        <div className="user-info">
          <span className="user-email">{user.email} ({user.role})</span>
          <button className="btn btn-secondary btn-sm" onClick={() => { setEditingTask(null); setShowForm(true); }}>
            + New Task
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks yet. Create one to get started.</div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-card-main">
                <div className="task-card-title">{task.title}</div>
                {task.description && <div className="task-card-desc">{task.description}</div>}
                <div className="task-card-meta">
                  <span className={`status-tag ${task.status}`}>{STATUS_LABELS[task.status] || task.status}</span>
                  {task.dueDate && (
                    <span className="due-date" style={{ color: isOverdue(task.dueDate, task.status) ? 'var(--error)' : undefined }}>
                      Due {formatDate(task.dueDate)}
                    </span>
                  )}
                  {user.role === 'admin' && task.owner && (
                    <span className="owner-email">{task.owner.email}</span>
                  )}
                </div>
              </div>
              <div className="task-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(task)}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          onClose={handleFormClose}
          onSaved={fetchTasks}
        />
      )}
    </div>
  );
}
