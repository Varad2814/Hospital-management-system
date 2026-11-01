#include "../include/Doctor.h"
#include <iostream>

// Quick registration constructor
Doctor::Doctor(const std::string& id, const std::string& name,
               const std::string& specialization)
    : Person(id, name),
      specialization(specialization),
      department("General"),
      isAvailable(true),
      consultationFee(500.0),
      patientsHandled(0)
{}

// Full registration constructor
Doctor::Doctor(const std::string& id, const std::string& name, int age,
               const std::string& gender, const std::string& contact,
               const std::string& specialization, const std::string& department,
               double consultationFee)
    : Person(id, name, age, gender, contact),
      specialization(specialization),
      department(department),
      isAvailable(true),
      consultationFee(consultationFee),
      patientsHandled(0)
{}

// Polymorphism: Override displayProfile
void Doctor::displayProfile() const {
    std::cout << "=== DOCTOR PROFILE ===\n"
              << "ID             : " << id              << "\n"
              << "Name           : " << name            << "\n"
              << "Age            : " << age             << "\n"
              << "Gender         : " << gender          << "\n"
              << "Contact        : " << contact         << "\n"
              << "Specialization : " << specialization  << "\n"
              << "Department     : " << department      << "\n"
              << "Available      : " << (isAvailable ? "Yes" : "No") << "\n"
              << "Patients Today : " << patientsHandled << "\n"
              << "Consult Fee    : $" << consultationFee << "\n";
}
