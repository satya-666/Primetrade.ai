import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { showToast } from './Toast';

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  dueDate: string;
}

interface Props {
  task?: {
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string | null;
  } | null;
  onClose: () => void;
  onSaved: () => void;
}

export function TaskForm({ task, onClose, onSaved }: Props) {
  const [form, setForm] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };

      let res;
      if (task) {
        res = await api.tasks.update(task.id, data);
      } else {
        res = await api.tasks.create(data);
      }

      if (res.success) {
        showToast('success', task ? 'Task updated' : 'Task created');
        onSaved();
        onClose();
      } else {
        setError(res.errors?.[0]?.message || res.message || 'Failed to save');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{task ? 'Edit Task' : 'New Task'}</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="desc">Description</label>
            <textarea
              id="desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="due">Due Date</label>
            <input
              id="due"
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
