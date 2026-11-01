import React, { useState } from 'react';
import { Stethoscope, Plus, X, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { generateId } from '../utils/helpers';

function DoctorCard({ doctor, onToggle }) {
  const initials = doctor.name.split(' ').filter(w => w).slice(-2).map(w => w[0]).join('');

  return (
    <div className={`card hover:shadow-md transition-all duration-200 ${!doctor.isAvailable ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0
          ${doctor.isAvailable ? 'bg-sage-100 text-sage-700' : 'bg-beige-200 text-slate-500'}`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800">{doctor.name}</p>
          <p className="text-xs text-slate-500">{doctor.specialization}</p>
          <span className={`inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
            doctor.isAvailable
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${doctor.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {doctor.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
        <span>🏥 {doctor.department}</span>
        <span>👤 {doctor.age} yrs · {doctor.gender}</span>
        <span>📞 {doctor.contact}</span>
        <span>💊 {doctor.patientsHandled} patients today</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-beige-100">
        <div>
          <p className="text-xs text-slate-400">Consultation Fee</p>
          <p className="font-semibold text-slate-700 text-sm">₹{doctor.consultationFee?.toLocaleString()}</p>
        </div>
        <button
          onClick={() => onToggle(doctor.id)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            doctor.isAvailable
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-sage-600 hover:bg-sage-50'
          }`}>
          {doctor.isAvailable
            ? <><ToggleRight size={16} className="text-sage-500" /> Set Unavailable</>
            : <><ToggleLeft size={16} className="text-slate-400" /> Set Available</>
          }
        </button>
      </div>
    </div>
  );
}

function AddDoctorForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: generateId('D'), name: '', age: '', gender: 'Male',
    contact: '', specialization: '', department: '', consultationFee: 500,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialization.trim()) {
      setError('Name and specialization are required');
      return;
    }
    setLoading(true);
    setError('');
    const result = await onAdd({
      ...form,
      age: parseInt(form.age) || 0,
      consultationFee: parseFloat(form.consultationFee) || 500,
    });
    setLoading(false);
    if (result.success) onClose();
    else setError(result.error || 'Failed to add doctor');
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-beige-200">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-sage-600" />
            Add New Doctor
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Doctor ID</label>
              <input className="input-field font-mono text-sm" value={form.id}
                onChange={e => set('id', e.target.value)} />
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input className="input-field" value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Dr. Jane Smith" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Age</label>
              <input className="input-field" type="number" value={form.age}
                onChange={e => set('age', e.target.value)} placeholder="35" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input-field" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Contact</label>
              <input className="input-field" value={form.contact}
                onChange={e => set('contact', e.target.value)} placeholder="555-0000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Specialization *</label>
              <input className="input-field" value={form.specialization}
                onChange={e => set('specialization', e.target.value)} placeholder="Cardiology" required />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input-field" value={form.department}
                onChange={e => set('department', e.target.value)} placeholder="ICU" />
            </div>
          </div>
          <div>
            <label className="label">Consultation Fee (₹)</label>
            <input className="input-field" type="number" value={form.consultationFee}
              onChange={e => set('consultationFee', e.target.value)} />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DoctorDirectory({ doctors, onAddDoctor, onToggleAvailability }) {
  const [showAdd, setShowAdd] = useState(false);
  const available   = doctors.filter(d => d.isAvailable);
  const unavailable = doctors.filter(d => !d.isAvailable);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Stethoscope size={18} className="text-teal-600" />
            </div>
            Doctor Directory
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Stored in C++ <code className="bg-beige-100 px-1.5 py-0.5 rounded text-xs">std::vector&lt;Doctor&gt;</code>
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Doctor
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-800">{doctors.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Doctors</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-sage-600">{available.length}</p>
          <p className="text-xs text-slate-400 mt-1">Available</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-slate-400">{unavailable.length}</p>
          <p className="text-xs text-slate-400 mt-1">Unavailable</p>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="card text-center py-16">
          <Stethoscope size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No doctors registered</p>
        </div>
      ) : (
        <>
          {available.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Available ({available.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {available.map(d => (
                  <DoctorCard key={d.id} doctor={d} onToggle={onToggleAvailability} />
                ))}
              </div>
            </div>
          )}
          {unavailable.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Unavailable ({unavailable.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {unavailable.map(d => (
                  <DoctorCard key={d.id} doctor={d} onToggle={onToggleAvailability} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showAdd && <AddDoctorForm onAdd={onAddDoctor} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
