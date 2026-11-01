import React from 'react';
import {
  Users, AlertTriangle, Stethoscope, DollarSign,
  TrendingUp, RefreshCw, ArrowRight, Activity
} from 'lucide-react';
import { formatCurrency, getTriageConfig } from '../utils/helpers';

function StatCard({ icon: Icon, label, value, sub, color, onClick }) {
  return (
    <div
      className={`card flex items-start gap-4 cursor-pointer hover:shadow-md transition-all duration-200 ${onClick ? 'hover:-translate-y-0.5' : ''}`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function RecentPatientRow({ patient }) {
  const tc = getTriageConfig(patient.triageLevel);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-beige-100 last:border-0">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${tc.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{patient.name}</p>
        <p className="text-xs text-slate-400">{patient.id} · {patient.admissionDate}</p>
      </div>
      <span className={tc.bgClass}>{tc.label}</span>
    </div>
  );
}

export default function Dashboard({ stats, patients, doctors, queue, onRefresh, setActiveTab }) {
  const activePatients = patients.filter(p => !p.isDischarged);
  const recentPatients = [...activePatients].slice(0, 6);
  const availableDoctors = doctors.filter(d => d.isAvailable);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <button onClick={onRefresh} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users} label="Active Patients" color="bg-sage-600"
          value={stats?.activePatients ?? '—'}
          sub={`${stats?.totalPatients ?? 0} total ever`}
          onClick={() => setActiveTab('patients')}
        />
        <StatCard
          icon={AlertTriangle} label="Emergency Cases" color="bg-red-400"
          value={stats?.emergencyCases ?? '—'}
          sub={`${stats?.emergencyQueueSize ?? 0} in queue`}
          onClick={() => setActiveTab('emergency')}
        />
        <StatCard
          icon={Stethoscope} label="Doctors On Duty" color="bg-teal-500"
          value={`${stats?.availableDoctors ?? '—'}/${stats?.totalDoctors ?? '—'}`}
          sub="currently available"
          onClick={() => setActiveTab('doctors')}
        />
        <StatCard
          icon={DollarSign} label="Total Revenue" color="bg-emerald-500"
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          sub="from discharged patients"
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Active Patients */}
        <div className="col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Activity size={16} className="text-sage-600" />
              Active Patients
            </h3>
            <button onClick={() => setActiveTab('patients')}
              className="text-xs text-sage-600 hover:text-sage-700 flex items-center gap-1 font-medium">
              View all <ArrowRight size={12} />
            </button>
          </div>
          {recentPatients.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No active patients</p>
          ) : (
            <div>{recentPatients.map(p => <RecentPatientRow key={p.id} patient={p} />)}</div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Emergency Queue preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 text-sm">
                <AlertTriangle size={14} className="text-red-400" />
                Emergency Queue
              </h3>
              <button onClick={() => setActiveTab('emergency')}
                className="text-xs text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1">
                Manage <ArrowRight size={11} />
              </button>
            </div>
            {queue.queue?.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-3">Queue is clear ✓</p>
            ) : (
              <div className="space-y-2">
                {queue.queue?.slice(0, 3).map((p, i) => {
                  const tc = getTriageConfig(p.triageLevel);
                  return (
                    <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${tc.cardBg}`}>
                      <span className="font-bold text-slate-400 w-4">{i + 1}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                      <span className={`font-medium flex-1 truncate ${tc.textClass}`}>{p.name}</span>
                      <span className={tc.bgClass}>{tc.label}</span>
                    </div>
                  );
                })}
                {queue.queue?.length > 3 && (
                  <p className="text-xs text-slate-400 text-center">+{queue.queue.length - 3} more</p>
                )}
              </div>
            )}
          </div>

          {/* Available Doctors */}
          <div className="card">
            <h3 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Stethoscope size={14} className="text-teal-500" />
              Available Doctors
            </h3>
            <div className="space-y-2">
              {availableDoctors.slice(0, 4).map(d => (
                <div key={d.id} className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 bg-sage-100 rounded-full flex items-center justify-center text-sage-600 font-bold flex-shrink-0">
                    {d.name.split(' ').pop()[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700 truncate">{d.name}</p>
                    <p className="text-slate-400">{d.specialization}</p>
                  </div>
                </div>
              ))}
              {availableDoctors.length === 0 && (
                <p className="text-slate-400 text-xs text-center py-2">No doctors available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
