#include "../include/Patient.h"
#include "../include/HospitalExceptions.h"
#include <iostream>
#include <sstream>
#include <ctime>
#include <iomanip>

// ── Helpers ──────────────────────────────────────────────────────────────────
static std::string currentDate() {
    std::time_t t = std::time(nullptr);
    std::tm* tm_ptr = std::localtime(&t);
    std::ostringstream oss;
    oss << std::put_time(tm_ptr, "%Y-%m-%d");
    return oss.str();
}

// ── Constructors ─────────────────────────────────────────────────────────────

// Quick registration (triage-only)
Patient::Patient(const std::string& id, const std::string& name, int triageLevel)
    : Person(id, name),
      triageLevel(triageLevel),
      isDischarged(false),
      isInPatient(triageLevel == 1),          // Critical → in-patient by default
      dailyRate(triageLevel == 1 ? 2500.0
              : triageLevel == 2 ? 1500.0
                                 : 800.0),
      daysAdmitted(1),
      admissionDate(currentDate()),
      dischargeDate(""),
      additionalCharges(0.0)
{
    if (triageLevel < 1 || triageLevel > 3)
        throw InvalidTriageLevelException(triageLevel);
}

// Full registration
Patient::Patient(const std::string& id, const std::string& name, int age,
                 const std::string& gender, const std::string& contact,
                 int triageLevel, bool isInPatient)
    : Person(id, name, age, gender, contact),
      triageLevel(triageLevel),
      isDischarged(false),
      isInPatient(isInPatient),
      dailyRate(triageLevel == 1 ? 2500.0
              : triageLevel == 2 ? 1500.0
                                 : 800.0),
      daysAdmitted(1),
      admissionDate(currentDate()),
      dischargeDate(""),
      additionalCharges(0.0)
{
    if (triageLevel < 1 || triageLevel > 3)
        throw InvalidTriageLevelException(triageLevel);
}

// ── Polymorphism ─────────────────────────────────────────────────────────────
void Patient::displayProfile() const {
    std::cout << "=== PATIENT PROFILE ===\n"
              << "ID        : " << id            << "\n"
              << "Name      : " << name          << "\n"
              << "Age       : " << age           << "\n"
              << "Gender    : " << gender        << "\n"
              << "Contact   : " << contact       << "\n"
              << "Triage    : " << getTriageLevelString() << "\n"
              << "Type      : " << (isInPatient ? "In-Patient" : "Out-Patient") << "\n"
              << "Admitted  : " << admissionDate << "\n"
              << "Discharged: " << (isDischarged ? "Yes (" + dischargeDate + ")" : "No") << "\n"
              << "Bill      : $" << calculateBill() << "\n";
}

// ── Billing (Polymorphic) ────────────────────────────────────────────────────
double Patient::calculateBill() const {
    double base = 0.0;
    if (isInPatient) {
        // In-patient: daily rate × days + registration + meds overhead
        base = dailyRate * daysAdmitted + 500.0;
    } else {
        // Out-patient: flat consultation + minor procedures
        base = 300.0 + (triageLevel == 2 ? 200.0 : 100.0);
    }
    return base + additionalCharges;
}

std::string Patient::getTriageLevelString() const {
    switch (triageLevel) {
        case 1: return "Critical";
        case 2: return "Urgent";
        case 3: return "Minor";
        default: return "Unknown";
    }
}
