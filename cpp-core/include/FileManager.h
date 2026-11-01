#pragma once
#include "HospitalDirectory.h"
#include "QueueManager.h"
#include <string>
#include <memory>

// SOLID: Single Responsibility — persistence layer only
// Handles reading/writing JSON and text files for data persistence
class FileManager {
private:
    std::string dataDir;

    std::string escapeJson(const std::string& s) const;
    std::string unescapeJson(const std::string& s) const;
    std::string currentTimestamp() const;

public:
    explicit FileManager(const std::string& dataDirectory = "./data");

    // Patients persistence
    bool savePatientsToJson(const HospitalDirectory& dir) const;
    bool loadPatientsFromJson(HospitalDirectory& dir) const;

    // Doctors persistence
    bool saveDoctorsToJson(const HospitalDirectory& dir) const;
    bool loadDoctorsFromJson(HospitalDirectory& dir) const;

    // Activity log persistence
    bool saveActivityLog(const std::vector<std::string>& log) const;

    // Full save / load
    bool saveAll(const HospitalDirectory& dir, const QueueManager& qm) const;
    bool loadAll(HospitalDirectory& dir) const;

    std::string getDataDir() const { return dataDir; }
};
