import React from 'react';
import {
  LayoutDashboard, AlertTriangle, Users, Stethoscope,
  Heart, ChevronRight, Cpu, Save
} from 'lucide-react';
import { api } from '../services/api';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'emergency', label: 'Emergency Triage',   icon: AlertTriangle   },
  { id: 'patients',  label: 'Patient Directory',  icon: Users           },
  { id: 'doctors',   label: 'Doctor Directory',   icon: Stethoscope     },
];

export default function Sidebar({ activeTab, setActiveTab, stats, engineMode }) {
  const handleSave = async () => {
    try { await api.saveData(); } catch (e) { console.error(e); }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-beige-200 flex flex-col shadow-sm z-40">
      {/* Logo */}
      <div className="p-5 border-b border-beige-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sage-600 rounded-xl flex items-center justify-center shadow-sm">
            <Heart size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">MediCore</h1>
            <p className="text-xs text-slate-400">Hospital Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group ${
                  isActive
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-beige-100 hover:text-slate-800'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-sage-600'} />
              <span className="flex-1 text-left">{label}</span>
              {id === 'emergency' && stats?.emergencyQueueSize > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse-soft">
                  {stats.emergencyQueueSize}
                </span>
              )}
              {isActive && <ChevronRight size={14} className="text-white/70" />}
            </button>
          );
        })}
      </nav>

      {/* Quick stats */}
      {stats && (
        <div className="p-4 border-t border-beige-200 space-y-2">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Quick Stats</p>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Active Patients</span>
            <span className="font-semibold text-slate-700">{stats.activePatients}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Emergency Cases</span>
            <span className="font-semibold text-red-500">{stats.emergencyCases}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Doctors Available</span>
            <span className="font-semibold text-sage-600">{stats.availableDoctors}/{stats.totalDoctors}</span>
          </div>
        </div>
      )}

      {/* Engine status + save */}
      <div className="p-4 border-t border-beige-200">
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={12} className="text-slate-400" />
          <span className="text-xs text-slate-400 truncate">{engineMode || 'Connecting...'}</span>
        </div>
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-500
                     hover:text-sage-600 hover:bg-beige-100 rounded-lg py-2 transition-all"
        >
          <Save size={13} />
          Save to Disk
        </button>
      </div>
    </aside>
  );
}
