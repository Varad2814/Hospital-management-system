#include "../include/HospitalEngine.h"
#include "../include/HospitalExceptions.h"
#include <sstream>
#include <iostream>
#include <algorithm>
#include <cctype>

// ── Construction & seed data ──────────────────────────────────────────────────
HospitalEngine::HospitalEngine()
    : fileManager("./data")
{
    // Try to load persisted data; if not found, seed defaults
    if (!fileManager.loadAll(directory)) {
        seedDefaultData();
    }
}

void HospitalEngine::seedDefaultData() {
    // Seed doctors
    auto d1 = std::make_shared<Doctor>("D001", "Dr. Sarah Chen", 42, "Female",
                                       "555-0101", "Cardiology", "Cardiology", 750.0);
    auto d2 = std::make_shared<Doctor>("D002", "Dr. James Patel", 38, "Male",
                                       "555-0102", "Emergency Medicine", "Emergency", 600.0);
    auto d3 = std::make_shared<Doctor>("D003", "Dr. Emily Torres", 35, "Female",
                                       "555-0103", "Neurology", "Neurology", 800.0);
    auto d4 = std::make_shared<Doctor>("D004", "Dr. Michael Kim", 45, "Male",
                                       "555-0104", "Orthopedics", "Orthopedics", 700.0);
    d4->setIsAvailable(false);
    directory.addDoctor(d1);
    directory.addDoctor(d2);
    directory.addDoctor(d3);
    directory.addDoctor(d4);

    // Seed patients
    auto p1 = std::make_shared<Patient>("P001", "Alice Johnson", 67, "Female",
                                        "555-1001", 1, true);
    auto p2 = std::make_shared<Patient>("P002", "Robert Smith", 45, "Male",
                                        "555-1002", 2, true);
    auto p3 = std::make_shared<Patient>("P003", "Maria Garcia", 28, "Female",
                                        "555-1003", 3, false);
    p3->setIsDischarged(true);

    directory.addPatient(p1);
    directory.addPatient(p2);
    directory.addPatient(p3);

    // Seed emergency queue
    queueManager.addToEmergencyQueue(p1);
    queueManager.addToEmergencyQueue(p2);

    fileManager.saveAll(directory, queueManager);
}

// ── JSON helpers ──────────────────────────────────────────────────────────────
std::string HospitalEngine::extractJsonField(const std::string& json,
                                              const std::string& field) const {
    std::string search = "\"" + field + "\"";
    auto pos = json.find(search);
    if (pos == std::string::npos) return "";
    pos = json.find(':', pos);
    if (pos == std::string::npos) return "";
    ++pos;
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t')) ++pos;
    if (pos >= json.size()) return "";
    if (json[pos] == '"') {
        ++pos;
        std::string val;
        while (pos < json.size() && json[pos] != '"') {
            if (json[pos] == '\\' && pos + 1 < json.size()) {
                ++pos;
                switch (json[pos]) {
                    case 'n': val += '\n'; break;
                    case 't': val += '\t'; break;
                    default:  val += json[pos];
                }
            } else {
                val += json[pos];
            }
            ++pos;
        }
        return val;
    }
    std::string val;
    while (pos < json.size() && json[pos] != ',' &&
           json[pos] != '}' && json[pos] != '\n' && json[pos] != ']')
        val += json[pos++];
    while (!val.empty() && (val.back() == ' ' || val.back() == '\r'))
        val.pop_back();
    return val;
}

int HospitalEngine::extractJsonInt(const std::string& json,
                                    const std::string& field, int defaultVal) const {
    std::string v = extractJsonField(json, field);
    if (v.empty()) return defaultVal;
    try { return std::stoi(v); } catch (...) { return defaultVal; }
}

bool HospitalEngine::extractJsonBool(const std::string& json,
                                      const std::string& field, bool defaultVal) const {
    std::string v = extractJsonField(json, field);
    if (v == "true") return true;
    if (v == "false") return false;
    return defaultVal;
}

double HospitalEngine::extractJsonDouble(const std::string& json,
                                          const std::string& field,
                                          double defaultVal) const {
    std::string v = extractJsonField(json, field);
    if (v.empty()) return defaultVal;
    try { return std::stod(v); } catch (...) { return defaultVal; }
}

static std::string esc(const std::string& s) {
    std::string result;
    for (char c : s) {
        if (c == '"')  result += "\\\"";
        else if (c == '\\') result += "\\\\";
        else if (c == '\n') result += "\\n";
        else result += c;
    }
    return result;
}

std::string HospitalEngine::patientToJson(const std::shared_ptr<Patient>& p) const {
    std::ostringstream os;
    os << "{"
       << "\"id\":\"" << esc(p->getId()) << "\","
       << "\"name\":\"" << esc(p->getName()) << "\","
       << "\"age\":" << p->getAge() << ","
       << "\"gender\":\"" << esc(p->getGender()) << "\","
       << "\"contact\":\"" << esc(p->getContact()) << "\","
       << "\"triageLevel\":" << p->getTriageLevel() << ","
       << "\"triageLevelString\":\"" << p->getTriageLevelString() << "\","
       << "\"isDischarged\":" << (p->getIsDischarged() ? "true" : "false") << ","
       << "\"isInPatient\":" << (p->getIsInPatient() ? "true" : "false") << ","
       << "\"daysAdmitted\":" << p->getDaysAdmitted() << ","
       << "\"additionalCharges\":" << p->getAdditionalCharges() << ","
       << "\"admissionDate\":\"" << esc(p->getAdmissionDate()) << "\","
       << "\"dischargeDate\":\"" << esc(p->getDischargeDate()) << "\","
       << "\"bill\":" << p->calculateBill()
       << "}";
    return os.str();
}

std::string HospitalEngine::doctorToJson(const std::shared_ptr<Doctor>& d) const {
    std::ostringstream os;
    os << "{"
       << "\"id\":\"" << esc(d->getId()) << "\","
       << "\"name\":\"" << esc(d->getName()) << "\","
       << "\"age\":" << d->getAge() << ","
       << "\"gender\":\"" << esc(d->getGender()) << "\","
       << "\"contact\":\"" << esc(d->getContact()) << "\","
       << "\"specialization\":\"" << esc(d->getSpecialization()) << "\","
       << "\"department\":\"" << esc(d->getDepartment()) << "\","
       << "\"isAvailable\":" << (d->getIsAvailable() ? "true" : "false") << ","
       << "\"consultationFee\":" << d->getConsultationFee() << ","
       << "\"patientsHandled\":" << d->getPatientsHandled()
       << "}";
    return os.str();
}

std::string HospitalEngine::successResponse(const std::string& data) const {
    return "{\"status\":\"success\",\"data\":" + data + "}";
}

std::string HospitalEngine::errorResponse(const std::string& message) const {
    return "{\"status\":\"error\",\"message\":\"" + esc(message) + "\"}";
}

// ── Command Handlers ──────────────────────────────────────────────────────────
std::string HospitalEngine::handleAddPatient(const std::string& body) {
    std::string id      = extractJsonField(body, "id");
    std::string name    = extractJsonField(body, "name");
    int age             = extractJsonInt(body, "age");
    std::string gender  = extractJsonField(body, "gender");
    std::string contact = extractJsonField(body, "contact");
    int triage          = extractJsonInt(body, "triageLevel", 3);
    bool inPat          = extractJsonBool(body, "isInPatient", triage == 1);

    if (id.empty() || name.empty())
        return errorResponse("Patient id and name are required");

    try {
        auto p = std::make_shared<Patient>(id, name, age, gender, contact, triage, inPat);
        directory.addPatient(p);

        // Auto-add to appropriate queue
        if (triage <= 2)
            queueManager.addToEmergencyQueue(p);
        else
            queueManager.addToRoutineQueue(p);

        fileManager.saveAll(directory, queueManager);
        return successResponse(patientToJson(p));
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleGetAllPatients() {
    auto patients = directory.getAllPatients();
    std::ostringstream os;
    os << "[";
    for (size_t i = 0; i < patients.size(); ++i) {
        os << patientToJson(patients[i]);
        if (i + 1 < patients.size()) os << ",";
    }
    os << "]";
    return successResponse(os.str());
}

std::string HospitalEngine::handleSearchPatient(const std::string& body) {
    std::string id   = extractJsonField(body, "id");
    std::string name = extractJsonField(body, "name");
    try {
        if (!id.empty()) {
            // Method overload: search by ID
            auto p = directory.searchPatient(id);
            return successResponse(patientToJson(p));
        } else if (!name.empty()) {
            // Method overload: search by Name
            auto results = directory.searchPatientByName(name);
            std::ostringstream os;
            os << "[";
            for (size_t i = 0; i < results.size(); ++i) {
                os << patientToJson(results[i]);
                if (i + 1 < results.size()) os << ",";
            }
            os << "]";
            return successResponse(os.str());
        }
        return errorResponse("Provide id or name to search");
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleDischargePatient(const std::string& body) {
    std::string id = extractJsonField(body, "id");
    try {
        bool ok = directory.dischargePatient(id);
        if (!ok) return errorResponse("Patient already discharged");
        auto p = directory.searchPatient(id);
        fileManager.saveAll(directory, queueManager);
        return successResponse(patientToJson(p));
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleGetBill(const std::string& body) {
    std::string id = extractJsonField(body, "id");
    try {
        auto p = directory.searchPatient(id);
        std::ostringstream os;
        os << "{"
           << "\"patientId\":\"" << esc(p->getId()) << "\","
           << "\"patientName\":\"" << esc(p->getName()) << "\","
           << "\"triageLevel\":" << p->getTriageLevel() << ","
           << "\"isInPatient\":" << (p->getIsInPatient() ? "true" : "false") << ","
           << "\"daysAdmitted\":" << p->getDaysAdmitted() << ","
           << "\"dailyRate\":" << p->getDailyRate() << ","
           << "\"additionalCharges\":" << p->getAdditionalCharges() << ","
           << "\"totalBill\":" << p->calculateBill() << ","
           << "\"isDischarged\":" << (p->getIsDischarged() ? "true" : "false")
           << "}";
        return successResponse(os.str());
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleAddDoctor(const std::string& body) {
    std::string id   = extractJsonField(body, "id");
    std::string name = extractJsonField(body, "name");
    int age          = extractJsonInt(body, "age");
    std::string gen  = extractJsonField(body, "gender");
    std::string con  = extractJsonField(body, "contact");
    std::string spec = extractJsonField(body, "specialization");
    std::string dept = extractJsonField(body, "department");
    double fee       = extractJsonDouble(body, "consultationFee", 500.0);

    if (id.empty() || name.empty())
        return errorResponse("Doctor id and name are required");

    auto d = std::make_shared<Doctor>(id, name, age, gen, con, spec, dept, fee);
    directory.addDoctor(d);
    fileManager.saveDoctorsToJson(directory);
    return successResponse(doctorToJson(d));
}

std::string HospitalEngine::handleGetAllDoctors() {
    auto doctors = directory.getAllDoctors();
    std::ostringstream os;
    os << "[";
    for (size_t i = 0; i < doctors.size(); ++i) {
        os << doctorToJson(doctors[i]);
        if (i + 1 < doctors.size()) os << ",";
    }
    os << "]";
    return successResponse(os.str());
}

std::string HospitalEngine::handleToggleDoctorAvailability(const std::string& body) {
    std::string id = extractJsonField(body, "id");
    auto d = directory.findDoctor(id);
    if (!d) return errorResponse("Doctor not found: " + id);
    d->setIsAvailable(!d->getIsAvailable());
    fileManager.saveDoctorsToJson(directory);
    return successResponse(doctorToJson(d));
}

std::string HospitalEngine::handleAddToEmergencyQueue(const std::string& body) {
    std::string id = extractJsonField(body, "id");
    try {
        auto p = directory.searchPatient(id);
        queueManager.addToEmergencyQueue(p);
        return successResponse("\"Added to emergency queue\"");
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleAdmitNext() {
    try {
        auto p = queueManager.admitNextEmergencyPatient();
        return successResponse(patientToJson(p));
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleGetEmergencyQueue() {
    auto queue = queueManager.peekEmergencyQueue();
    std::ostringstream os;
    os << "{\"queue\":[";
    for (size_t i = 0; i < queue.size(); ++i) {
        os << patientToJson(queue[i]);
        if (i + 1 < queue.size()) os << ",";
    }
    os << "],\"size\":" << queue.size() << ","
       << "\"routineSize\":" << queueManager.getRoutineQueueSize() << "}";
    return successResponse(os.str());
}

std::string HospitalEngine::handleAddToRoutineQueue(const std::string& body) {
    std::string id = extractJsonField(body, "id");
    try {
        auto p = directory.searchPatient(id);
        queueManager.addToRoutineQueue(p);
        return successResponse("\"Added to routine queue\"");
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleProcessRoutine() {
    try {
        auto p = queueManager.processNextRoutineAppointment();
        return successResponse(patientToJson(p));
    } catch (const HospitalException& e) {
        return errorResponse(e.what());
    }
}

std::string HospitalEngine::handleGetStats() {
    std::ostringstream os;
    os << "{"
       << "\"totalPatients\":" << directory.getTotalPatientsEver() << ","
       << "\"activePatients\":" << directory.getActivePatientCount() << ","
       << "\"emergencyCases\":" << directory.getEmergencyCaseCount() << ","
       << "\"availableDoctors\":" << directory.getAvailableDoctorCount() << ","
       << "\"totalDoctors\":" << directory.getAllDoctors().size() << ","
       << "\"emergencyQueueSize\":" << queueManager.getEmergencyQueueSize() << ","
       << "\"routineQueueSize\":" << queueManager.getRoutineQueueSize() << ","
       << "\"totalRevenue\":" << directory.getTotalRevenue()
       << "}";
    return successResponse(os.str());
}

std::string HospitalEngine::handleSaveData() {
    bool ok = fileManager.saveAll(directory, queueManager);
    return ok ? successResponse("\"Data saved successfully\"")
              : errorResponse("Failed to save data");
}

// ── Main Dispatcher ───────────────────────────────────────────────────────────
std::string HospitalEngine::processCommand(const std::string& commandJson) {
    std::string cmd = extractJsonField(commandJson, "command");
    std::string body = commandJson;  // pass full JSON; handlers extract their fields

    try {
        if (cmd == "addPatient")                 return handleAddPatient(body);
        if (cmd == "getAllPatients")              return handleGetAllPatients();
        if (cmd == "searchPatient")              return handleSearchPatient(body);
        if (cmd == "dischargePatient")           return handleDischargePatient(body);
        if (cmd == "getBill")                    return handleGetBill(body);
        if (cmd == "addDoctor")                  return handleAddDoctor(body);
        if (cmd == "getAllDoctors")               return handleGetAllDoctors();
        if (cmd == "toggleDoctorAvailability")   return handleToggleDoctorAvailability(body);
        if (cmd == "addToEmergencyQueue")        return handleAddToEmergencyQueue(body);
        if (cmd == "admitNext")                  return handleAdmitNext();
        if (cmd == "getEmergencyQueue")          return handleGetEmergencyQueue();
        if (cmd == "addToRoutineQueue")          return handleAddToRoutineQueue(body);
        if (cmd == "processRoutine")             return handleProcessRoutine();
        if (cmd == "getStats")                   return handleGetStats();
        if (cmd == "saveData")                   return handleSaveData();
        return errorResponse("Unknown command: " + cmd);
    } catch (const std::exception& e) {
        return errorResponse(std::string("Internal error: ") + e.what());
    }
}
