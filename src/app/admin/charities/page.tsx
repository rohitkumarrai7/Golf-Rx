'use client';

import { motion } from 'framer-motion';
import { Heart, Plus, Edit2, Trash2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', is_featured: false });
  const [saving, setSaving] = useState(false);

  const fetchCharities = () => {
    fetch('/api/admin/charities')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCharities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCharities(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', image_url: '', is_featured: false });
    setShowModal(true);
  };

  const openEdit = (charity: any) => {
    setEditing(charity);
    setForm({
      name: charity.name,
      description: charity.description,
      image_url: charity.image_url || '',
      is_featured: charity.is_featured,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch('/api/admin/charities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? 'Charity updated' : 'Charity created');
      setShowModal(false);
      fetchCharities();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this charity?')) return;
    try {
      await fetch(`/api/admin/charities?id=${id}`, { method: 'DELETE' });
      toast.success('Charity deleted');
      fetchCharities();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" /> Charity Management
          </h1>
          <p className="text-slate-500 mt-1">{charities.length} charities</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Charity
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {charities.map((charity) => (
            <Card key={charity.id} className="flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-linear-to-br from-rose-400 to-rose-600 flex items-center justify-center shrink-0 overflow-hidden">
                {charity.image_url ? (
                  <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
                ) : (
                  <Heart className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 truncate">{charity.name}</h3>
                  {charity.is_featured && (
                    <Badge variant="warning"><Star className="h-3 w-3 mr-0.5" /> Featured</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{charity.description}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(charity)}
                    className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(charity.id)}
                    className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Charity' : 'Add Charity'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Charity name..."
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
              placeholder="Describe the charity..."
            />
          </div>
          <Input
            label="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://..."
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
            />
            Featured Charity (shown on homepage)
          </label>
          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving} className="flex-1">
              {editing ? 'Update' : 'Create'} Charity
            </Button>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
