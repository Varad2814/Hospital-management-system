#pragma once
#include "Patient.h"
#include "Doctor.h"
#include <unordered_map>
#include <vector>
#include <memory>
#include <string>

// SOLID: Single Responsibility — only manages the patient/doctor directory
// DS: std::unordered_map for O(1) patient lookups
class HospitalDirectory {
private:
    // Primary patient store: ID -> Patient (O(1) lookup)
    std::unordered_map<std::string, std::shared_ptr<Patient>> patientMap;

    // Doctor list (DS: std::vector)
    std::vector<std::shared_ptr<Doctor>> doctors;

    int totalPatientsEver;
    double totalRevenue;

public:
    HospitalDirectory();

    // --- Patient Operations ---
    void addPatient(std::shared_ptr<Patient> patient);
    void removePatient(const std::string& id);

    // Method overloading: searchPatient by ID vs by Name
    std::shared_ptr<Patient> searchPatient(const std::string& id) const;
    std::vector<std::shared_ptr<Patient>> searchPatientByName(const std::string& name) const;

    std::vector<std::shared_ptr<Patient>> getAllPatients() const;
    std::vector<std::shared_ptr<Patient>> getActivePatients() const;
    std::vector<std::shared_ptr<Patient>> getDischargedPatients() const;

    bool patientExists(const std::string& id) const;
    bool dischargePatient(const std::string& id);

    // --- Doctor Operations ---
    void addDoctor(std::shared_ptr<Doctor> doctor);
    std::shared_ptr<Doctor> findDoctor(const std::string& id) const;
    std::vector<std::shared_ptr<Doctor>> getAvailableDoctors() const;
    std::vector<std::shared_ptr<Doctor>> getAllDoctors() const;

    // --- Statistics ---
    int getTotalPatientsEver()     const { return totalPatientsEver; }
    int getActivePatientCount()    const;
    int getAvailableDoctorCount()  const;
    int getEmergencyCaseCount()    const;
    double getTotalRevenue()       const { return totalRevenue; }
    void addRevenue(double amount)       { totalRevenue += amount; }
};
