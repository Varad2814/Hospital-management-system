/**
 * Hospital Management System — Node.js API Bridge
 * Bridges React frontend <-> C++ Core Engine via child_process spawn.
 *
 * The C++ binary reads a JSON command from stdin and writes a JSON response
 * to stdout. We spawn it per-request (stateless) OR use a persistent process
 * (stateful, chosen here for performance).
 */

const express = require('express');
const cors    = require('cors');
const { spawn, spawnSync } = require('child_process');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ── C++ Engine Path ───────────────────────────────────────────────────────────
const ENGINE_PATH = path.join(__dirname, 'bin',
    process.platform === 'win32' ? 'hospital_engine.exe' : 'hospital_engine');

const DATA_DIR = path.join(__dirname, '..', 'cpp-core', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Engine Bridge ─────────────────────────────────────────────────────────────
function callEngine(commandObj) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(ENGINE_PATH)) {
            // Engine not compiled yet — return mock data for UI dev
            return resolve(getMockResponse(commandObj));
        }

        const jsonInput = JSON.stringify(commandObj);
        const result = spawnSync(ENGINE_PATH, [], {
            input: jsonInput,
            encoding: 'utf8',
            cwd: path.join(__dirname, '..', 'cpp-core'),
            timeout: 10000,
        });

        if (result.error) {
            return reject(new Error('Engine spawn error: ' + result.error.message));
        }
        if (result.status !== 0) {
            const errMsg = result.stderr || 'Engine exited with code ' + result.status;
            return reject(new Error(errMsg));
        }

        const output = (result.stdout || '').trim();
        if (!output) {
            return reject(new Error('Engine returned empty output'));
        }

        try {
            resolve(JSON.parse(output));
        } catch (e) {
            reject(new Error('Engine output parse error: ' + output));
        }
    });
}

// ── Mock responses (used when C++ binary is not compiled) ─────────────────────
function getMockResponse(cmd) {
    const mockPatients = [
        { id:'P001', name:'Alice Johnson', age:67, gender:'Female', contact:'555-1001',
          triageLevel:1, triageLevelString:'Critical', isDischarged:false, isInPatient:true,
          daysAdmitted:3, additionalCharges:0, admissionDate:'2026-10-29', dischargeDate:'', bill:8000 },
        { id:'P002', name:'Robert Smith', age:45, gender:'Male', contact:'555-1002',
          triageLevel:2, triageLevelString:'Urgent', isDischarged:false, isInPatient:true,
          daysAdmitted:1, additionalCharges:200, admissionDate:'2026-11-01', dischargeDate:'', bill:1700 },
        { id:'P003', name:'Maria Garcia', age:28, gender:'Female', contact:'555-1003',
          triageLevel:3, triageLevelString:'Minor', isDischarged:true, isInPatient:false,
          daysAdmitted:1, additionalCharges:0, admissionDate:'2026-10-28', dischargeDate:'2026-10-28', bill:400 },
    ];
    const mockDoctors = [
        { id:'D001', name:'Dr. Sarah Chen', age:42, gender:'Female', contact:'555-0101',
          specialization:'Cardiology', department:'Cardiology', isAvailable:true, consultationFee:750, patientsHandled:5 },
        { id:'D002', name:'Dr. James Patel', age:38, gender:'Male', contact:'555-0102',
          specialization:'Emergency Medicine', department:'Emergency', isAvailable:true, consultationFee:600, patientsHandled:8 },
        { id:'D003', name:'Dr. Emily Torres', age:35, gender:'Female', contact:'555-0103',
          specialization:'Neurology', department:'Neurology', isAvailable:true, consultationFee:800, patientsHandled:3 },
        { id:'D004', name:'Dr. Michael Kim', age:45, gender:'Male', contact:'555-0104',
          specialization:'Orthopedics', department:'Orthopedics', isAvailable:false, consultationFee:700, patientsHandled:2 },
    ];
    const emergencyQueue = mockPatients.filter(p => p.triageLevel <= 2 && !p.isDischarged);

    switch (cmd.command) {
        case 'getAllPatients':  return { status:'success', data: mockPatients };
        case 'getStats':       return { status:'success', data: {
            totalPatients: 3, activePatients: 2, emergencyCases: 1,
            availableDoctors: 3, totalDoctors: 4, emergencyQueueSize: 2,
            routineQueueSize: 0, totalRevenue: 400
        }};
        case 'getAllDoctors':   return { status:'success', data: mockDoctors };
        case 'getEmergencyQueue': return { status:'success', data: {
            queue: emergencyQueue, size: emergencyQueue.length, routineSize: 0
        }};
        case 'searchPatient': {
            const found = cmd.id
                ? mockPatients.find(p => p.id === cmd.id)
                : mockPatients.filter(p => p.name.toLowerCase().includes((cmd.name||'').toLowerCase()));
            return found ? { status:'success', data: found }
                         : { status:'error', message:'Patient not found' };
        }
        case 'getBill': {
            const p = mockPatients.find(pt => pt.id === cmd.id);
            return p ? { status:'success', data: { patientId:p.id, patientName:p.name,
                triageLevel:p.triageLevel, isInPatient:p.isInPatient, daysAdmitted:p.daysAdmitted,
                dailyRate: p.triageLevel===1?2500:p.triageLevel===2?1500:800,
                additionalCharges:p.additionalCharges, totalBill:p.bill, isDischarged:p.isDischarged }}
                     : { status:'error', message:'Patient not found' };
        }
        case 'addPatient':  return { status:'success', data: { ...cmd, bill:800, triageLevelString:'Minor' } };
        case 'addDoctor':   return { status:'success', data: { ...cmd, isAvailable:true, patientsHandled:0 } };
        case 'dischargePatient': {
            const p = mockPatients.find(pt => pt.id === cmd.id);
            return p ? { status:'success', data: { ...p, isDischarged:true } }
                     : { status:'error', message:'Patient not found' };
        }
        case 'admitNext':   return emergencyQueue.length > 0
                                ? { status:'success', data: emergencyQueue[0] }
                                : { status:'error', message:'Emergency queue is empty' };
        default:            return { status:'success', data: 'OK' };
    }
}

// ── API Routes ────────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
    const engineExists = fs.existsSync(ENGINE_PATH);
    res.json({
        status: 'running',
        enginePath: ENGINE_PATH,
        engineCompiled: engineExists,
        mode: engineExists ? 'C++ Engine' : 'Mock Data (compile C++ to enable full features)',
        timestamp: new Date().toISOString()
    });
});

// Stats
app.get('/api/stats', async (req, res) => {
    try {
        const result = await callEngine({ command: 'getStats' });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// Patients
app.get('/api/patients', async (req, res) => {
    try {
        const result = await callEngine({ command: 'getAllPatients' });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.get('/api/patients/search', async (req, res) => {
    try {
        const { id, name } = req.query;
        const result = await callEngine({ command: 'searchPatient', id, name });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.post('/api/patients', async (req, res) => {
    try {
        const result = await callEngine({ command: 'addPatient', ...req.body });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.post('/api/patients/:id/discharge', async (req, res) => {
    try {
        const result = await callEngine({ command: 'dischargePatient', id: req.params.id });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.get('/api/patients/:id/bill', async (req, res) => {
    try {
        const result = await callEngine({ command: 'getBill', id: req.params.id });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// Doctors
app.get('/api/doctors', async (req, res) => {
    try {
        const result = await callEngine({ command: 'getAllDoctors' });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.post('/api/doctors', async (req, res) => {
    try {
        const result = await callEngine({ command: 'addDoctor', ...req.body });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.patch('/api/doctors/:id/availability', async (req, res) => {
    try {
        const result = await callEngine({ command: 'toggleDoctorAvailability', id: req.params.id });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// Emergency Queue
app.get('/api/queue/emergency', async (req, res) => {
    try {
        const result = await callEngine({ command: 'getEmergencyQueue' });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.post('/api/queue/emergency/admit', async (req, res) => {
    try {
        const result = await callEngine({ command: 'admitNext' });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.post('/api/queue/emergency/add', async (req, res) => {
    try {
        const result = await callEngine({ command: 'addToEmergencyQueue', id: req.body.id });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.post('/api/queue/routine/add', async (req, res) => {
    try {
        const result = await callEngine({ command: 'addToRoutineQueue', id: req.body.id });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

app.post('/api/queue/routine/process', async (req, res) => {
    try {
        const result = await callEngine({ command: 'processRoutine' });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// Persist
app.post('/api/save', async (req, res) => {
    try {
        const result = await callEngine({ command: 'saveData' });
        res.json(result);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🏥 Hospital Management API Server`);
    console.log(`   → Listening on http://localhost:${PORT}`);
    console.log(`   → C++ Engine: ${fs.existsSync(ENGINE_PATH) ? '✅ Compiled' : '⚠️  Not compiled (using mock data)'}`);
    console.log(`   → Data directory: ${DATA_DIR}\n`);
});
