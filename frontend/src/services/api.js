// API service — all fetch calls to the Node.js backend
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  // Health
  health:   ()    => request('/health'),

  // Stats
  getStats: ()    => request('/stats'),

  // Patients
  getPatients:    ()          => request('/patients'),
  searchPatient:  (params)    => request(`/patients/search?${new URLSearchParams(params)}`),
  addPatient:     (data)      => request('/patients', { method:'POST', body: JSON.stringify(data) }),
  dischargePatient:(id)       => request(`/patients/${id}/discharge`, { method:'POST' }),
  getPatientBill: (id)        => request(`/patients/${id}/bill`),

  // Doctors
  getDoctors:     ()          => request('/doctors'),
  addDoctor:      (data)      => request('/doctors', { method:'POST', body: JSON.stringify(data) }),
  toggleDoctor:   (id)        => request(`/doctors/${id}/availability`, { method:'PATCH' }),

  // Emergency queue
  getEmergencyQueue:  ()      => request('/queue/emergency'),
  admitNext:          ()      => request('/queue/emergency/admit', { method:'POST' }),
  addToEmergency:     (id)    => request('/queue/emergency/add', { method:'POST', body: JSON.stringify({ id }) }),
  addToRoutine:       (id)    => request('/queue/routine/add', { method:'POST', body: JSON.stringify({ id }) }),
  processRoutine:     ()      => request('/queue/routine/process', { method:'POST' }),

  // Persist
  saveData: () => request('/save', { method: 'POST' }),
};
