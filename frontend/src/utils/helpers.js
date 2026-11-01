// Triage utilities shared across components
export const TRIAGE = {
  1: { label: 'Critical', color: '#E57373', bgClass: 'badge-critical', dot: 'bg-red-400',
       cardBg: 'bg-red-50 border-red-200', textClass: 'text-red-700', icon: '🔴' },
  2: { label: 'Urgent',   color: '#FFB74D', bgClass: 'badge-urgent',   dot: 'bg-amber-400',
       cardBg: 'bg-amber-50 border-amber-200', textClass: 'text-amber-700', icon: '🟡' },
  3: { label: 'Minor',    color: '#81C784', bgClass: 'badge-minor',    dot: 'bg-emerald-400',
       cardBg: 'bg-emerald-50 border-emerald-200', textClass: 'text-emerald-700', icon: '🟢' },
};

export function getTriageConfig(level) {
  return TRIAGE[level] || TRIAGE[3];
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function generateId(prefix) {
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}${n}`;
}
