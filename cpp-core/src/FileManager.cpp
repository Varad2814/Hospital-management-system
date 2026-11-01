#include "../include/FileManager.h"
#include "../include/HospitalExceptions.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <ctime>
#include <iomanip>
#include <sys/stat.h>
#ifdef _WIN32
#  include <direct.h>
#endif

FileManager::FileManager(const std::string& dataDirectory)
    : dataDir(dataDirectory) {
    // Ensure data directory exists (cross-platform simple approach)
#ifdef _WIN32
    _mkdir(dataDirectory.c_str());
#else
    mkdir(dataDirectory.c_str(), 0755);
#endif
}

std::string FileManager::currentTimestamp() const {
    std::time_t t = std::time(nullptr);
    std::tm* tm_ptr = std::localtime(&t);
    std::ostringstream oss;
    oss << std::put_time(tm_ptr, "%Y-%m-%dT%H:%M:%S");
    return oss.str();
}

std::string FileManager::escapeJson(const std::string& s) const {
    std::string result;
    for (char c : s) {
        switch (c) {
            case '"':  result += "\\\""; break;
            case '\\': result += "\\\\"; break;
            case '\n': result += "\\n";  break;
            case '\r': result += "\\r";  break;
            case '\t': result += "\\t";  break;
            default:   result += c;
        }
    }
    return result;
}

bool FileManager::savePatientsToJson(const HospitalDirectory& dir) const {
    std::string path = dataDir + "/patients.json";
    std::ofstream out(path);
    if (!out.is_open()) return false;

    auto patients = dir.getAllPatients();
    out << "[\n";
    for (size_t i = 0; i < patients.size(); ++i) {
        const auto& p = patients[i];
        out << "  {\n"
            << "    \"id\":\"" << escapeJson(p->getId()) << "\",\n"
            << "    \"name\":\"" << escapeJson(p->getName()) << "\",\n"
            << "    \"age\":" << p->getAge() << ",\n"
            << "    \"gender\":\"" << escapeJson(p->getGender()) << "\",\n"
            << "    \"contact\":\"" << escapeJson(p->getContact()) << "\",\n"
            << "    \"triageLevel\":" << p->getTriageLevel() << ",\n"
            << "    \"isDischarged\":" << (p->getIsDischarged() ? "true" : "false") << ",\n"
            << "    \"isInPatient\":" << (p->getIsInPatient() ? "true" : "false") << ",\n"
            << "    \"daysAdmitted\":" << p->getDaysAdmitted() << ",\n"
            << "    \"additionalCharges\":" << p->getAdditionalCharges() << ",\n"
            << "    \"admissionDate\":\"" << escapeJson(p->getAdmissionDate()) << "\",\n"
            << "    \"dischargeDate\":\"" << escapeJson(p->getDischargeDate()) << "\",\n"
            << "    \"bill\":" << p->calculateBill() << "\n"
            << "  }" << (i + 1 < patients.size() ? "," : "") << "\n";
    }
    out << "]\n";
    return true;
}

bool FileManager::saveDoctorsToJson(const HospitalDirectory& dir) const {
    std::string path = dataDir + "/doctors.json";
    std::ofstream out(path);
    if (!out.is_open()) return false;

    auto doctors = dir.getAllDoctors();
    out << "[\n";
    for (size_t i = 0; i < doctors.size(); ++i) {
        const auto& d = doctors[i];
        out << "  {\n"
            << "    \"id\":\"" << escapeJson(d->getId()) << "\",\n"
            << "    \"name\":\"" << escapeJson(d->getName()) << "\",\n"
            << "    \"age\":" << d->getAge() << ",\n"
            << "    \"gender\":\"" << escapeJson(d->getGender()) << "\",\n"
            << "    \"contact\":\"" << escapeJson(d->getContact()) << "\",\n"
            << "    \"specialization\":\"" << escapeJson(d->getSpecialization()) << "\",\n"
            << "    \"department\":\"" << escapeJson(d->getDepartment()) << "\",\n"
            << "    \"isAvailable\":" << (d->getIsAvailable() ? "true" : "false") << ",\n"
            << "    \"consultationFee\":" << d->getConsultationFee() << ",\n"
            << "    \"patientsHandled\":" << d->getPatientsHandled() << "\n"
            << "  }" << (i + 1 < doctors.size() ? "," : "") << "\n";
    }
    out << "]\n";
    return true;
}

bool FileManager::saveActivityLog(const std::vector<std::string>& log) const {
    std::string path = dataDir + "/activity.log";
    std::ofstream out(path, std::ios::app);
    if (!out.is_open()) return false;
    for (const auto& entry : log)
        out << entry << "\n";
    return true;
}

bool FileManager::saveAll(const HospitalDirectory& dir, const QueueManager& qm) const {
    bool ok = true;
    ok &= savePatientsToJson(dir);
    ok &= saveDoctorsToJson(dir);
    ok &= saveActivityLog(qm.getActivityLog());
    return ok;
}

bool FileManager::loadAll(HospitalDirectory& dir) const {
    bool ok = true;
    ok &= loadPatientsFromJson(dir);
    ok &= loadDoctorsFromJson(dir);
    return ok;
}

// ── Simple JSON parsers ───────────────────────────────────────────────────────
static std::string extractField(const std::string& obj, const std::string& key) {
    std::string search = "\"" + key + "\"";
    auto pos = obj.find(search);
    if (pos == std::string::npos) return "";
    pos = obj.find(':', pos);
    if (pos == std::string::npos) return "";
    ++pos;
    while (pos < obj.size() && (obj[pos] == ' ' || obj[pos] == '\t')) ++pos;
    if (pos >= obj.size()) return "";
    if (obj[pos] == '"') {
        ++pos;
        std::string val;
        while (pos < obj.size() && obj[pos] != '"') {
            if (obj[pos] == '\\' && pos + 1 < obj.size()) {
                ++pos;
                if (obj[pos] == 'n') val += '\n';
                else val += obj[pos];
            } else {
                val += obj[pos];
            }
            ++pos;
        }
        return val;
    }
    // number / bool
    std::string val;
    while (pos < obj.size() && obj[pos] != ',' && obj[pos] != '}' && obj[pos] != '\n')
        val += obj[pos++];
    // trim
    while (!val.empty() && (val.back() == ' ' || val.back() == '\r'))
        val.pop_back();
    return val;
}

bool FileManager::loadPatientsFromJson(HospitalDirectory& dir) const {
    std::string path = dataDir + "/patients.json";
    std::ifstream in(path);
    if (!in.is_open()) return false;

    std::ostringstream ss;
    ss << in.rdbuf();
    std::string content = ss.str();

    // Split by objects
    size_t pos = 0;
    while ((pos = content.find('{', pos)) != std::string::npos) {
        size_t end = content.find('}', pos);
        if (end == std::string::npos) break;
        std::string obj = content.substr(pos, end - pos + 1);
        pos = end + 1;

        std::string id   = extractField(obj, "id");
        std::string name = extractField(obj, "name");
        if (id.empty() || name.empty()) continue;

        int  age         = std::stoi(extractField(obj, "age").empty() ? "0"
                                     : extractField(obj, "age"));
        std::string gen  = extractField(obj, "gender");
        std::string con  = extractField(obj, "contact");
        int  triage      = std::stoi(extractField(obj, "triageLevel").empty() ? "3"
                                     : extractField(obj, "triageLevel"));
        bool inPat       = extractField(obj, "isInPatient") == "true";
        bool discharged  = extractField(obj, "isDischarged") == "true";
        int  days        = std::stoi(extractField(obj, "daysAdmitted").empty() ? "1"
                                     : extractField(obj, "daysAdmitted"));
        double addChrg   = std::stod(extractField(obj, "additionalCharges").empty() ? "0"
                                     : extractField(obj, "additionalCharges"));

        try {
            auto p = std::make_shared<Patient>(id, name, age, gen, con, triage, inPat);
            p->setIsDischarged(discharged);
            p->setDaysAdmitted(days);
            p->setAdditionalCharges(addChrg);
            if (!dir.patientExists(id))
                dir.addPatient(p);
        } catch (...) { /* skip corrupt entries */ }
    }
    return true;
}

bool FileManager::loadDoctorsFromJson(HospitalDirectory& dir) const {
    std::string path = dataDir + "/doctors.json";
    std::ifstream in(path);
    if (!in.is_open()) return false;

    std::ostringstream ss;
    ss << in.rdbuf();
    std::string content = ss.str();

    size_t pos = 0;
    while ((pos = content.find('{', pos)) != std::string::npos) {
        size_t end = content.find('}', pos);
        if (end == std::string::npos) break;
        std::string obj = content.substr(pos, end - pos + 1);
        pos = end + 1;

        std::string id   = extractField(obj, "id");
        std::string name = extractField(obj, "name");
        if (id.empty() || name.empty()) continue;

        int  age    = std::stoi(extractField(obj, "age").empty() ? "0"
                                : extractField(obj, "age"));
        std::string gen  = extractField(obj, "gender");
        std::string con  = extractField(obj, "contact");
        std::string spec = extractField(obj, "specialization");
        std::string dept = extractField(obj, "department");
        double fee  = std::stod(extractField(obj, "consultationFee").empty() ? "500"
                                : extractField(obj, "consultationFee"));
        bool avail  = extractField(obj, "isAvailable") != "false";

        try {
            auto d = std::make_shared<Doctor>(id, name, age, gen, con, spec, dept, fee);
            d->setIsAvailable(avail);
            if (!dir.findDoctor(id))
                dir.addDoctor(d);
        } catch (...) {}
    }
    return true;
}
