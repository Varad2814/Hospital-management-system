#pragma once
#include "Person.h"
#include <string>

// OOP: Inheritance, Encapsulation, Polymorphism
class Doctor : public Person {
private:
    std::string specialization;
    std::string department;
    bool        isAvailable;
    double      consultationFee;
    int         patientsHandled;

public:
    // Constructor overloading: Quick doctor registration
    Doctor(const std::string& id, const std::string& name,
           const std::string& specialization);

    // Full doctor registration
    Doctor(const std::string& id, const std::string& name, int age,
           const std::string& gender, const std::string& contact,
           const std::string& specialization, const std::string& department,
           double consultationFee = 500.0);

    // Polymorphism: Override pure virtual from Person
    void displayProfile() const override;

    // Getters
    std::string getSpecialization()  const { return specialization; }
    std::string getDepartment()      const { return department; }
    bool        getIsAvailable()     const { return isAvailable; }
    double      getConsultationFee() const { return consultationFee; }
    int         getPatientsHandled() const { return patientsHandled; }

    // Setters
    void setIsAvailable(bool a)               { isAvailable = a; }
    void setDepartment(const std::string& d)  { department = d; }
    void setConsultationFee(double f)         { consultationFee = f; }
    void incrementPatientsHandled()           { ++patientsHandled; }
};
