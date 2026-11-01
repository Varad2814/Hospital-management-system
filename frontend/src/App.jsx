import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmergencyTriage from './components/EmergencyTriage';
import PatientDirectory from './components/PatientDirectory';
import DoctorDirectory from './components/DoctorDirectory';
import BillingModal from './components/BillingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats]     = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors]   = useState([]);
  const [queue, setQueue]       = useState({ queue: [], size: 0, routineSize: 0 });
  const [loading, setLoading]   = useState(true);
  const [notification, setNotification] = useState(null);
  const [billingPatient, setBillingPatient] = useState(null);
  const [engineMode, setEngineMode] = useState('');

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [statsRes, patientsRes, doctorsRes, queueRes, healthRes] = await Promise.all([
        api.getStats(),
        api.getPatients(),
        api.getDoctors(),
        api.getEmergencyQueue(),
        api.health(),
      ]);
      if (statsRes.status === 'success')    setStats(statsRes.data);
      if (patientsRes.status === 'success') setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      if (doctorsRes.status === 'success')  setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      if (queueRes.status === 'success')    setQueue(queueRes.data);
      if (healthRes.mode)                   setEngineMode(healthRes.mode);
    } catch (e) {
      showNotification('Failed to connect to backend. Is the server running?', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshAll, 30000);
    return () => clearInterval(interval);
  }, [refreshAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading MediCore...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        engineMode={engineMode}
      />

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top notification bar */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
            animate-fade-in flex items-center gap-2 ${
              notification.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : notification.type === 'warning'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-sage-50 text-sage-700 border border-sage-200'
            }`}>
            {notification.type === 'error'   ? '❌' :
             notification.type === 'warning' ? '⚠️' : '✅'}
            {notification.message}
          </div>
        )}

        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              patients={patients}
              doctors={doctors}
              queue={queue}
              onRefresh={refreshAll}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'emergency' && (
            <EmergencyTriage
              queue={queue}
              patients={patients}
              onAdmitNext={async () => {
                try {
                  const res = await api.admitNext();
                  if (res.status === 'success') {
                    showNotification(`Admitted: ${res.data.name} [${res.data.triageLevelString}]`);
                    await refreshAll();
                  } else {
                    showNotification(res.message, 'error');
                  }
                } catch (e) { showNotification(e.message, 'error'); }
              }}
              onRefresh={refreshAll}
              showNotification={showNotification}
            />
          )}
          {activeTab === 'patients' && (
            <PatientDirectory
              patients={patients}
              onAddPatient={async (data) => {
                const res = await api.addPatient(data);
                if (res.status === 'success') {
                  showNotification(`Patient ${res.data.name} registered successfully!`);
                  await refreshAll();
                  return { success: true };
                }
                showNotification(res.message, 'error');
                return { success: false, error: res.message };
              }}
              onDischarge={async (id) => {
                const res = await api.dischargePatient(id);
                if (res.status === 'success') {
                  showNotification(`Patient ${res.data.name} discharged.`);
                  await refreshAll();
                } else showNotification(res.message, 'error');
              }}
              onViewBill={(patient) => setBillingPatient(patient)}
              showNotification={showNotification}
            />
          )}
          {activeTab === 'doctors' && (
            <DoctorDirectory
              doctors={doctors}
              onAddDoctor={async (data) => {
                const res = await api.addDoctor(data);
                if (res.status === 'success') {
                  showNotification(`Dr. ${res.data.name} added successfully!`);
                  await refreshAll();
                  return { success: true };
                }
                showNotification(res.message, 'error');
                return { success: false, error: res.message };
              }}
              onToggleAvailability={async (id) => {
                const res = await api.toggleDoctor(id);
                if (res.status === 'success') {
                  showNotification(`Doctor availability updated.`);
                  await refreshAll();
                } else showNotification(res.message, 'error');
              }}
            />
          )}
        </div>
      </main>

      {/* Billing Modal */}
      {billingPatient && (
        <BillingModal
          patient={billingPatient}
          onClose={() => setBillingPatient(null)}
          onDischarge={async (id) => {
            const res = await api.dischargePatient(id);
            if (res.status === 'success') {
              showNotification(`Patient ${res.data.name} discharged successfully.`);
              setBillingPatient(null);
              await refreshAll();
            } else showNotification(res.message, 'error');
          }}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
