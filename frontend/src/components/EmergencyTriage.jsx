import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, UserCheck, RefreshCw, Info, Clock } from 'lucide-react';
import { getTriageConfig, formatCurrency } from '../utils/helpers';
import { api } from '../services/api';

function QueueCard({ patient, position }) {
  const tc = getTriageConfig(patient.triageLevel);
  const isPulse = patient.triageLevel === 1;

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all
      ${tc.cardBg} ${isPulse ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Position badge */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
        ${position === 1 ? 'bg-slate-700 text-white' : 'bg-white text-slate-500 border border-beige-300'}`}>
        {position}
      </div>

      {/* Triage dot */}
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${tc.dot} ${isPulse ? 'animate-pulse-soft' : ''}`} />

      {/* Patient info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800">{patient.name}</p>
          <span className={tc.bgClass}>{tc.label}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {patient.id} · Age {patient.age} · {patient.gender}
        </p>
        {patient.contact && (
          <p className="text-xs text-slate-400 mt-0.5">📞 {patient.contact}</p>
        )}
      </div>

      {/* Bill estimate */}
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-slate-400">Est. Bill</p>
        <p className={`font-semibold text-sm ${tc.textClass}`}>{formatCurrency(patient.bill || 0)}</p>
        <p className="text-xs text-slate-400 mt-0.5">{patient.isInPatient ? 'In-Patient' : 'Out-Patient'}</p>
      </div>

      <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
    </div>
  );
}

function TriageLegend() {
  return (
    <div className="flex items-center gap-6 text-xs text-slate-500">
      {[
        { level: 1, desc: 'Critical — Immediate life threat' },
        { level: 2, desc: 'Urgent — Serious condition' },
        { level: 3, desc: 'Minor — Non-critical' },
      ].map(({ level, desc }) => {
        const tc = getTriageConfig(level);
        return (
          <div key={level} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${tc.dot}`} />
            <span>{desc}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function EmergencyTriage({ queue, patients, onAdmitNext, onRefresh, showNotification }) {
  const [admitting, setAdmitting] = useState(false);
  const [processingRoutine, setProcessingRoutine] = useState(false);

  const handleAdmitNext = async () => {
    setAdmitting(true);
    try { await onAdmitNext(); }
    finally { setAdmitting(false); }
  };

  const handleProcessRoutine = async () => {
    setProcessingRoutine(true);
    try {
      const res = await api.processRoutine();
      if (res.status === 'success') {
        showNotification(`Processed routine appointment: ${res.data.name}`);
        await onRefresh();
      } else {
        showNotification(res.message, 'error');
      }
    } catch (e) { showNotification(e.message, 'error'); }
    finally { setProcessingRoutine(false); }
  };

  const emergencyQueue = queue.queue || [];
  const criticalCount = emergencyQueue.filter(p => p.triageLevel === 1).length;
  const urgentCount   = emergencyQueue.filter(p => p.triageLevel === 2).length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            Emergency Triage
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Priority queue — powered by C++ <code className="bg-beige-100 px-1.5 py-0.5 rounded text-xs">std::priority_queue</code>
          </p>
        </div>
        <button onClick={onRefresh} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Control bar */}
      <div className="card mb-5">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Queue summary */}
          <div className="flex items-center gap-4 flex-1">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-800">{emergencyQueue.length}</p>
              <p className="text-xs text-slate-400">In Queue</p>
            </div>
            <div className="h-8 w-px bg-beige-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
              <p className="text-xs text-slate-400">Critical</p>
            </div>
            <div className="h-8 w-px bg-beige-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">{urgentCount}</p>
              <p className="text-xs text-slate-400">Urgent</p>
            </div>
            <div className="h-8 w-px bg-beige-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-500">{queue.routineSize || 0}</p>
              <p className="text-xs text-slate-400">Routine</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleProcessRoutine}
              disabled={processingRoutine || (queue.routineSize || 0) === 0}
              className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock size={14} />
              Process Routine {queue.routineSize > 0 ? `(${queue.routineSize})` : ''}
            </button>
            <button
              onClick={handleAdmitNext}
              disabled={admitting || emergencyQueue.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCheck size={16} />
              {admitting ? 'Admitting...' : 'Admit Next Patient'}
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Info size={12} />
        <TriageLegend />
      </div>

      {/* Queue list */}
      {emergencyQueue.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck size={28} className="text-emerald-500" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">Emergency Queue is Clear</h3>
          <p className="text-sm text-slate-400">No critical or urgent patients waiting</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Sorted by priority (Critical → Urgent) · C++ comparator active
          </p>
          {emergencyQueue.map((patient, i) => (
            <QueueCard key={patient.id} patient={patient} position={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
