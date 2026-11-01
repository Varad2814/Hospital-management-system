#include "../include/HospitalDirectory.h"
#include "../include/HospitalExceptions.h"
#include <algorithm>
#include <cctype>

HospitalDirectory::HospitalDirectory()
    : totalPatientsEver(0), totalRevenue(0.0) {}

// ── Patient Operations ────────────────────────────────────────────────────────
void HospitalDirectory::addPatient(std::shared_ptr<Patient> patient) {
    if (patientExists(patient->getId()))
        throw DuplicatePatientException(patient->getId());
    patientMap[patient->getId()] = patient;
    ++totalPatientsEver;
}

void HospitalDirectory::removePatient(const std::string& id) {
    if (!patientExists(id))
        throw InvalidPatientIdException(id);
    patientMap.erase(id);
}

// Method overloading: search by ID (O(1) unordered_map lookup)
std::shared_ptr<Patient> HospitalDirectory::searchPatient(
    const std::string& id) const
{
    auto it = patientMap.find(id);
    if (it == patientMap.end())
        throw InvalidPatientIdException(id);
    return it->second;
}

// Method overloading: search by Name (O(n) scan)
std::vector<std::shared_ptr<Patient>> HospitalDirectory::searchPatientByName(
    const std::string& name) const
{
    std::vector<std::shared_ptr<Patient>> results;
    std::string nameLower = name;
    std::transform(nameLower.begin(), nameLower.end(),
                   nameLower.begin(), ::tolower);

    for (auto it = patientMap.begin(); it != patientMap.end(); ++it) {
        const std::shared_ptr<Patient>& p = it->second;
        std::string pNameLower = p->getName();
        std::transform(pNameLower.begin(), pNameLower.end(),
                       pNameLower.begin(), ::tolower);
        if (pNameLower.find(nameLower) != std::string::npos)
            results.push_back(p);
    }
    return results;
}

std::vector<std::shared_ptr<Patient>> HospitalDirectory::getAllPatients() const {
    std::vector<std::shared_ptr<Patient>> result;
    result.reserve(patientMap.size());
    for (auto it = patientMap.begin(); it != patientMap.end(); ++it)
        result.push_back(it->second);
    return result;
}

std::vector<std::shared_ptr<Patient>> HospitalDirectory::getActivePatients() const {
    std::vector<std::shared_ptr<Patient>> result;
    for (auto it = patientMap.begin(); it != patientMap.end(); ++it)
        if (!it->second->getIsDischarged())
            result.push_back(it->second);
    return result;
}

std::vector<std::shared_ptr<Patient>> HospitalDirectory::getDischargedPatients() const {
    std::vector<std::shared_ptr<Patient>> result;
    for (auto it = patientMap.begin(); it != patientMap.end(); ++it)
        if (it->second->getIsDischarged())
            result.push_back(it->second);
    return result;
}

bool HospitalDirectory::patientExists(const std::string& id) const {
    return patientMap.find(id) != patientMap.end();
}

bool HospitalDirectory::dischargePatient(const std::string& id) {
    std::shared_ptr<Patient> p = searchPatient(id);  // throws if not found
    if (p->getIsDischarged()) return false;
    p->setIsDischarged(true);
    // Capture revenue
    totalRevenue += p->calculateBill();
    return true;
}

// ── Doctor Operations ─────────────────────────────────────────────────────────
void HospitalDirectory::addDoctor(std::shared_ptr<Doctor> doctor) {
    doctors.push_back(doctor);
}

std::shared_ptr<Doctor> HospitalDirectory::findDoctor(const std::string& id) const {
    for (size_t i = 0; i < doctors.size(); ++i)
        if (doctors[i]->getId() == id) return doctors[i];
    return std::shared_ptr<Doctor>();
}

std::vector<std::shared_ptr<Doctor>> HospitalDirectory::getAvailableDoctors() const {
    std::vector<std::shared_ptr<Doctor>> result;
    for (size_t i = 0; i < doctors.size(); ++i)
        if (doctors[i]->getIsAvailable()) result.push_back(doctors[i]);
    return result;
}

std::vector<std::shared_ptr<Doctor>> HospitalDirectory::getAllDoctors() const {
    return doctors;
}

// ── Statistics ────────────────────────────────────────────────────────────────
int HospitalDirectory::getActivePatientCount() const {
    int count = 0;
    for (auto it = patientMap.begin(); it != patientMap.end(); ++it)
        if (!it->second->getIsDischarged()) ++count;
    return count;
}

int HospitalDirectory::getAvailableDoctorCount() const {
    int count = 0;
    for (size_t i = 0; i < doctors.size(); ++i)
        if (doctors[i]->getIsAvailable()) ++count;
    return count;
}

int HospitalDirectory::getEmergencyCaseCount() const {
    int count = 0;
    for (auto it = patientMap.begin(); it != patientMap.end(); ++it)
        if (!it->second->getIsDischarged() && it->second->getTriageLevel() == 1) ++count;
    return count;
}
