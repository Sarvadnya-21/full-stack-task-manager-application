import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Edit2, Loader } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', status: 'pending' });
    const [editingId, setEditingId] = useState(null);
    const [msg, setMsg] = useState(null);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            setTasks(res.data.tasks);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const resetForm = () => {
        setFormData({ title: '', description: '', status: 'pending' });
        setEditingId(null);
        setShowForm(false);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/tasks/${editingId}`, formData);
                setMsg({ type: 'success', text: 'Task updated successfully!' });
            } else {
                await api.post('/tasks', formData);
                setMsg({ type: 'success', text: 'Task created successfully!' });
            }
            fetchTasks();
            resetForm();
            setTimeout(() => setMsg(null), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.message || 'Action failed' });
            setTimeout(() => setMsg(null), 3000);
        }
    };

    const onEdit = (task) => {
        setFormData({ title: task.title, description: task.description || '', status: task.status });
        setEditingId(task.id);
        setShowForm(true);
    };

    const onDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            setMsg({ type: 'success', text: 'Task deleted successfully!' });
            fetchTasks();
            setTimeout(() => setMsg(null), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.message || 'Delete failed' });
            setTimeout(() => setMsg(null), 3000);
        }
    };

    return (
        <div className="container animate-fade">
            <div className="page-header">
                <h2>{user.role === 'admin' ? 'Admin Dashboard - All Tasks' : 'My Tasks'}</h2>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    <Plus size={16} /> {showForm ? 'Cancel' : 'New Task'}
                </button>
            </div>

            {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

            {showForm && (
                <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <form onSubmit={onSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)', color: 'white', outline: 'none' }} placeholder="Task Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div style={{ flex: '2 1 300px' }}>
                            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)', color: 'white', outline: 'none' }} placeholder="Description (Optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div style={{ flex: '1 1 100px' }}>
                            <select style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)', color: 'white', outline: 'none' }} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Save'}</button>
                    </form>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No tasks found. Create one to get started!
                </div>
            ) : (
                <div className="task-grid">
                    {tasks.map(task => (
                        <div key={task.id} className="task-card glass">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{task.title}</h3>
                                <span className={`status-badge status-${task.status}`}>{task.status.replace('-', ' ')}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>{task.description || 'No description provided.'}</p>
                            {user.role === 'admin' && task.user && <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '0.5rem' }}>Owner: {task.user?.username}</div>}

                            <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => onEdit(task)}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
