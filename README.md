# 🏥 MediCore — Hospital & Patient Management System

A full-stack, production-grade Hospital Management System featuring a **C++ Core Engine** implementing advanced Data Structures & OOP, a **Node.js API bridge**, and a **React UI** with a calm healthcare-themed design (Soft Sage Green + Warm Beige).

---

## 📁 Project Structure

```
Course Project/
├── cpp-core/                   ← C++ Engine (Pure OOP + Data Structures)
│   ├── include/
│   │   ├── Person.h            ← Abstract Base Class (ABC)
│   │   ├── Patient.h           ← Derived: Encapsulation, Polymorphism
│   │   ├── Doctor.h            ← Derived: Polymorphism
│   │   ├── QueueManager.h      ← std::priority_queue + std::queue
│   │   ├── HospitalDirectory.h ← std::unordered_map + std::vector
│   │   ├── HospitalExceptions.h← Custom exception hierarchy
│   │   ├── FileManager.h       ← SOLID persistence layer
│   │   └── HospitalEngine.h    ← Command dispatcher (stdin/stdout JSON)
│   ├── src/
│   │   ├── Person.cpp
│   │   ├── Patient.cpp
│   │   ├── Doctor.cpp
│   │   ├── QueueManager.cpp
│   │   ├── HospitalDirectory.cpp
│   │   ├── FileManager.cpp
│   │   ├── HospitalEngine.cpp
│   │   └── main.cpp            ← Entry point
│   ├── data/                   ← Auto-created: patients.json, doctors.json
│   └── CMakeLists.txt
│
├── backend/                    ← Node.js API Bridge
│   ├── server.js               ← Express server + C++ child process bridge
│   ├── bin/                    ← Compiled C++ binary goes here
│   └── package.json
│
├── frontend/                   ← React UI
│   ├── src/
│   │   ├── App.jsx             ← Root component + state management
│   │   ├── components/
│   │   │   ├── Sidebar.jsx     ← Navigation sidebar
│   │   │   ├── Dashboard.jsx   ← Overview cards & stats
│   │   │   ├── EmergencyTriage.jsx ← Priority queue visualization
│   │   │   ├── PatientDirectory.jsx← Search, filter, add patients
│   │   │   ├── DoctorDirectory.jsx ← Doctor management
│   │   │   └── BillingModal.jsx    ← Invoice generator & discharge
│   │   ├── services/
│   │   │   └── api.js          ← All fetch calls to backend
│   │   └── utils/
│   │       └── helpers.js      ← Triage config, formatting utilities
│   ├── index.html
│   ├── tailwind.config.js      ← Custom sage green + beige palette
│   ├── vite.config.js
│   └── package.json
│
├── build.ps1                   ← One-click build script (Windows)
└── README.md
```

---

## 🧬 C++ OOP & Data Structures Concepts Used

| Concept | Where Used |
|---|---|
| **Abstract Base Class** | `Person` with `pure virtual displayProfile()` |
| **Inheritance** | `Patient : Person`, `Doctor : Person` |
| **Polymorphism** | `displayProfile()` overridden in Patient & Doctor |
| **Encapsulation** | Private members + public getters/setters in all classes |
| **Constructor Overloading** | `Patient(id, name, triage)` vs `Patient(id, name, age, gender, ...)` |
| **Method Overloading** | `searchPatient(id)` vs `searchPatientByName(name)` |
| **Custom Exceptions** | `InvalidPatientIdException`, `EmptyQueueException`, etc. |
| **`std::priority_queue`** | Emergency Triage — `ComparePatientPriority` comparator |
| **`std::queue`** | Routine FIFO appointment queue |
| **`std::unordered_map`** | Patient Directory — O(1) lookup by ID |
| **`std::vector`** | Doctor list, activity log, history |
| **`std::shared_ptr`** | Smart pointer ownership for Patient/Doctor objects |
| **File Persistence** | `patients.json`, `doctors.json`, `activity.log` |
| **SOLID Principles** | Separate classes for Queue, Directory, File, Engine |

---

## 🚀 Setup & Build Instructions

### Prerequisites
- **C++ Compiler**: MinGW-w64 (g++) or MSVC (Visual Studio Build Tools)
- **CMake** ≥ 3.14
- **Node.js** ≥ 18 (with npm)
- **Git** (optional)

---

### Step 1 — Build the C++ Engine

Open **PowerShell** or **Command Prompt** and run:

```powershell
# Navigate to the C++ directory
cd "C:\Users\varad\Desktop\SEM 3\OOP\Course Project\cpp-core"

# Create and enter build directory
mkdir build
cd build

# Configure with CMake (MinGW)
cmake .. -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release

# Build
cmake --build . --config Release
```

> **Alternative (MSVC):**
> ```powershell
> cmake .. -G "Visual Studio 17 2022"
> cmake --build . --config Release
> ```

This produces `hospital_engine.exe` in `backend/bin/`.

---

### Step 2 — Install & Start the Node.js Backend

```powershell
cd "C:\Users\varad\Desktop\SEM 3\OOP\Course Project\backend"
npm install
node server.js
```

The backend runs on **http://localhost:3001**

> **Note:** If the C++ binary is not compiled, the backend uses mock data so the frontend still works for UI development.

---

### Step 3 — Install & Start the React Frontend

Open a **new terminal**:

```powershell
cd "C:\Users\varad\Desktop\SEM 3\OOP\Course Project\frontend"
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🎨 UI Color Palette

| Role | Color | Hex |
|---|---|---|
| Primary Accent | Sage Green | `#2E7D63` |
| Background | Warm Beige | `#F7F6F2` |
| Card Surface | Light Beige | `#EAE8E1` |
| Text | Deep Slate | `#334155` |
| Critical Triage | Soft Coral Red | `#E57373` |
| Urgent Triage | Soft Amber | `#FFB74D` |
| Minor Triage | Soft Green | `#81C784` |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health & engine status |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/patients` | All patients |
| GET | `/api/patients/search?id=P001` | Search by ID (unordered_map) |
| GET | `/api/patients/search?name=Alice` | Search by name |
| POST | `/api/patients` | Register new patient |
| POST | `/api/patients/:id/discharge` | Discharge patient |
| GET | `/api/patients/:id/bill` | Get billing invoice |
| GET | `/api/doctors` | All doctors |
| POST | `/api/doctors` | Add new doctor |
| PATCH | `/api/doctors/:id/availability` | Toggle availability |
| GET | `/api/queue/emergency` | Emergency priority queue |
| POST | `/api/queue/emergency/admit` | Admit next patient |
| POST | `/api/queue/routine/process` | Process next routine appointment |
| POST | `/api/save` | Persist all data to disk |

---

## 🖥️ Features

### Dashboard
- Live stats: active patients, emergency cases, available doctors, revenue
- Recent patient activity feed
- Emergency queue preview
- Available doctor list

### Emergency Triage
- Color-coded live queue (Critical 🔴 → Urgent 🟡 → Minor 🟢)
- Powered by `std::priority_queue` with custom `ComparePatientPriority`
- "Admit Next Patient" button
- Routine queue processor

### Patient Directory
- Full registration form with validation
- Live search (name, ID, contact)
- Filter by status: All / Active / Discharged / Critical
- O(1) ID lookup via `std::unordered_map`

### Doctor Directory
- Add/view doctors stored in `std::vector`
- Toggle availability with live UI update
- Available vs unavailable grouping

### Billing & Discharge
- Auto-calculated invoice (in-patient vs out-patient)
- Extra charges input (medicines, tests)
- Print-ready invoice layout
- One-click discharge and bill settlement

---

## 📝 Notes for OOP Course Submission

- All OOP concepts are implemented in `cpp-core/` following strict SOLID principles
- The `ComparePatientPriority` struct demonstrates custom STL comparators
- Exception hierarchy (`HospitalExceptions.h`) shows multi-level inheritance for exception types
- `HospitalEngine.cpp` acts as the Facade pattern, dispatching to specialized managers
- The Node.js backend is intentionally thin — all business logic is in C++
