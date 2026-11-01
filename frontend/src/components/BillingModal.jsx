import React, { useState, useEffect } from 'react';
import { X, FileText, Printer, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { getTriageConfig, formatCurrency, formatDate } from '../utils/helpers';

export default function BillingModal({ patient, onClose, onDischarge, showNotification }) {
  const [bill, setBill]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [discharging, setDischarging] = useState(false);
  const [extraCharges, setExtraCharges] = useState('');

  const tc = getTriageConfig(patient.triageLevel);

  useEffect(() => {
    api.getPatientBill(patient.id)
      .then(res => {
        if (res.status === 'success') setBill(res.data);
        else showNotification(res.message, 'error');
      })
      .catch(e => showNotification(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [patient.id]);

  const handleDischarge = async () => {
    setDischarging(true);
    await onDischarge(patient.id);
    setDischarging(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Computed total with extra charges input
  const parsedExtra = parseFloat(extraCharges) || 0;
  const baseTotal   = bill?.totalBill || 0;
  const grandTotal  = baseTotal + parsedExtra;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-beige-200 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-sage-600" />
            Patient Invoice
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              <Printer size={12} />
              Print
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-1">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Hospital letterhead */}
        <div className="bg-sage-600 text-white p-5">
          <h2 className="text-xl font-bold">MediCore Hospital</h2>
          <p className="text-sage-200 text-xs mt-0.5">123 Healthcare Ave · contact@medicore.hospital</p>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-sage-200">Invoice Date</p>
              <p className="font-medium">{new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-sage-200">Invoice No.</p>
              <p className="font-mono font-medium">INV-{patient.id}-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Patient Info */}
          <div className="bg-beige-50 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Patient Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-slate-400">Patient ID</p>
                <p className="font-mono font-medium text-slate-700">{patient.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="font-medium text-slate-700">{patient.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Triage Level</p>
                <span className={tc.bgClass}>{tc.label}</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Type</p>
                <p className="text-slate-700">{patient.isInPatient ? 'In-Patient' : 'Out-Patient'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Admission Date</p>
                <p className="text-slate-700">{formatDate(patient.admissionDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className={patient.isDischarged ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                  {patient.isDischarged ? '✓ Discharged' : '⏳ Active'}
                </p>
              </div>
            </div>
          </div>

          {/* Bill Breakdown */}
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Calculating bill...</div>
          ) : bill ? (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Charges Breakdown</h4>
              <div className="space-y-2">
                {bill.isInPatient ? (
                  <>
                    <BillRow label="Daily Room Rate" value={formatCurrency(bill.dailyRate)} />
                    <BillRow label={`Days Admitted (×${bill.daysAdmitted})`}
                      value={formatCurrency(bill.dailyRate * bill.daysAdmitted)} />
                    <BillRow label="Registration & Admin" value={formatCurrency(500)} />
                  </>
                ) : (
                  <>
                    <BillRow label="Consultation Fee" value={formatCurrency(300)} />
                    <BillRow label="Procedure Charges"
                      value={formatCurrency(patient.triageLevel === 2 ? 200 : 100)} />
                  </>
                )}
                {bill.additionalCharges > 0 && (
                  <BillRow label="Additional Charges" value={formatCurrency(bill.additionalCharges)} />
                )}
                <div className="border-t border-beige-200 pt-2">
                  <BillRow label="Subtotal" value={formatCurrency(bill.totalBill)} bold />
                </div>

                {/* Extra charges input */}
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex-1">
                    <p className="text-xs text-amber-700 font-medium mb-1">Add Extra Charges (medicines, tests, etc.)</p>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 text-sm">₹</span>
                      <input
                        type="number"
                        value={extraCharges}
                        onChange={e => setExtraCharges(e.target.value)}
                        className="flex-1 bg-white border border-amber-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                        placeholder="0"
                        min={0}
                      />
                    </div>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="bg-sage-600 text-white rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sage-200 text-xs">Grand Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(grandTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sage-200 text-xs">GST Included</p>
                    <p className="text-sm text-sage-100">All charges inclusive</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-red-500 text-sm">Failed to load bill</div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Close</button>
            {!patient.isDischarged && (
              <button
                onClick={handleDischarge}
                disabled={discharging}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                <CheckCircle size={16} />
                {discharging ? 'Discharging...' : 'Discharge & Settle Bill'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BillRow({ label, value, bold }) {
  return (
    <div className={`flex items-center justify-between text-sm py-1 ${bold ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-sage-700' : ''}>{value}</span>
    </div>
  );
}
