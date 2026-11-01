import React, { useState, useMemo } from 'react';
import {
  Users, Search, Plus, X, UserX, FileText,
  Filter, ChevronDown
} from 'lucide-react';
import { getTriageConfig, formatCurrency, formatDate, generateId } from '../utils/helpers';

// ── Patient Card ──────────────────────────────────────────────────────────────
function PatientCard({ patient, onDischarge, onViewBill }) {
  const tc = getTriageConfig(patient.triageLevel);
  return (
    <div className={`card hover:shadow-md transition-all duration-200 ${patient.isDischarged ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${tc.cardBg}`}>
            <span className={tc.textClass}>{patient.name[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{patient.name}</p>
            <p className="text-xs text-slate-400">{patient.id}</p>
          </div>
        </div>
        <span className={tc.bgClass}>{tc.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
        <span>👤 {patient.age} yrs · {patient.gender}</span>
        <span>📞 {patient.contact}</span>
        <span>🏥 {patient.isInPatient ? 'In-Patient' : 'Out-Patient'}</span>
        <span>📅 {formatDate(patient.admissionDate)}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-beige-100">
        <div>
          <p className="text-xs text-slate-400">Est. Bill</p>
          <p className="font-semibold text-slate-700 text-sm">{formatCurrency(patient.bill)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onViewBill(patient)}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            <FileText size={12} />
            Invoice
          </button>
          {!patient.isDischarged && (
            <button onClick={() => onDischarge(patient.id)}
              className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
              <UserX size={12} />
              Discharge
            </button>
          )}
          {patient.isDischarged && (
            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              ✓ Discharged
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Patient Form ──────────────────────────────────────────────────────────
function AddPatientForm({ onAdd, onClose }) {
  const [form, setForm] = useState({
    id: generateId('P'),
    name: '', age: '', gender: 'Male', contact: '',
    triageLevel: 3, isInPatient: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Patient name is required'); return; }
    setLoading(true);
    setError('');
    const result = await onAdd({
      ...form,
      age: parseInt(form.age) || 0,
      triageLevel: parseInt(form.triageLevel),
    });
    setLoading(false);
    if (result.success) onClose();
    else setError(result.error || 'Failed to add patient');
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-beige-200">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Plus size={18} className="text-sage-600" />
            Register New Patient
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Patient ID</label>
              <input className="input-field font-mono text-sm" value={form.id}
                onChange={e => set('id', e.target.value)} placeholder="P1234" />
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input className="input-field" value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="John Doe" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Age</label>
              <input className="input-field" type="number" value={form.age}
                onChange={e => set('age', e.target.value)} placeholder="35" min={0} max={150} />
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
              <label className="label">Triage Level</label>
              <select className="input-field" value={form.triageLevel}
                onChange={e => set('triageLevel', parseInt(e.target.value))}>
                <option value={1}>1 — Critical 🔴</option>
                <option value={2}>2 — Urgent 🟡</option>
                <option value={3}>3 — Minor 🟢</option>
              </select>
            </div>
            <div>
              <label className="label">Admission Type</label>
              <select className="input-field" value={form.isInPatient ? 'true' : 'false'}
                onChange={e => set('isInPatient', e.target.value === 'true')}>
                <option value="true">In-Patient (Admitted)</option>
                <option value="false">Out-Patient (Consultation)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PatientDirectory({ patients, onAddPatient, onDischarge, onViewBill, showNotification }) {
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all'); // all | active | discharged | critical
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    let list = patients;
    if (filter === 'active')     list = list.filter(p => !p.isDischarged);
    if (filter === 'discharged') list = list.filter(p => p.isDischarged);
    if (filter === 'critical')   list = list.filter(p => p.triageLevel === 1 && !p.isDischarged);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.id.toLowerCase().includes(s) ||
        p.contact?.includes(s)
      );
    }
    return list;
  }, [patients, search, filter]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-sage-100 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-sage-600" />
            </div>
            Patient Directory
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            O(1) lookup via C++ <code className="bg-beige-100 px-1.5 py-0.5 rounded text-xs">std::unordered_map</code>
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Patient
        </button>
      </div>

      {/* Search & Filter bar */}
      <div className="card mb-5 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by name, ID, or contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all','active','discharged','critical'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'bg-beige-100 text-slate-600 hover:bg-beige-200'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-400 mb-4">
        Showing {filtered.length} of {patients.length} patients
      </p>

      {/* Patient grid */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Users size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No patients found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <PatientCard
              key={p.id} patient={p}
              onDischarge={onDischarge}
              onViewBill={onViewBill}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddPatientForm
          onAdd={onAddPatient}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
