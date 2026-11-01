#pragma once
#include "HospitalDirectory.h"
#include "QueueManager.h"
#include "FileManager.h"
#include <string>
#include <memory>

// Top-level command dispatcher — bridges JSON commands from Node.js to C++ core
// SOLID: Open/Closed — add new commands without modifying existing handlers
class HospitalEngine {
private:
    HospitalDirectory directory;
    QueueManager      queueManager;
    FileManager       fileManager;

    // Command handlers — each returns a JSON string response
    std::string handleAddPatient(const std::string& jsonBody);
    std::string handleGetAllPatients();
    std::string handleSearchPatient(const std::string& jsonBody);
    std::string handleDischargePatient(const std::string& jsonBody);
    std::string handleGetBill(const std::string& jsonBody);

    std::string handleAddDoctor(const std::string& jsonBody);
    std::string handleGetAllDoctors();
    std::string handleToggleDoctorAvailability(const std::string& jsonBody);

    std::string handleAddToEmergencyQueue(const std::string& jsonBody);
    std::string handleAdmitNext();
    std::string handleGetEmergencyQueue();
    std::string handleAddToRoutineQueue(const std::string& jsonBody);
    std::string handleProcessRoutine();

    std::string handleGetStats();
    std::string handleSaveData();

    // JSON helpers
    std::string patientToJson(const std::shared_ptr<Patient>& p) const;
    std::string doctorToJson(const std::shared_ptr<Doctor>& d) const;
    std::string successResponse(const std::string& data) const;
    std::string errorResponse(const std::string& message) const;

    // Simple JSON field extractor (no external lib needed)
    std::string extractJsonField(const std::string& json,
                                 const std::string& field) const;
    int extractJsonInt(const std::string& json, const std::string& field,
                       int defaultVal = 0) const;
    bool extractJsonBool(const std::string& json, const std::string& field,
                         bool defaultVal = false) const;
    double extractJsonDouble(const std::string& json, const std::string& field,
                             double defaultVal = 0.0) const;

public:
    HospitalEngine();

    // Main entry point: receives a JSON command, returns a JSON response
    std::string processCommand(const std::string& commandJson);

    // Seed default data for demo
    void seedDefaultData();
};
