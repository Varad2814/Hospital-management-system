#pragma once
#include "Person.h"
#include <vector>
#include <string>
#include <ctime>

// OOP: Inheritance, Encapsulation, Polymorphism
class Patient : public Person {
private:
    int         triageLevel;      // 1=Critical, 2=Urgent, 3=Minor
    std::vector<std::string> medicalHistory;
    bool        isDischarged;
    bool        isInPatient;
    double      dailyRate;
    int         daysAdmitted;
    std::string admissionDate;
    std::string dischargeDate;
    double      additionalCharges;

public:
    // Constructor overloading: Quick registration (triage only)
    Patient(const std::string& id, const std::string& name, int triageLevel);

    // Full patient registration
    Patient(const std::string& id, const std::string& name, int age,
            const std::string& gender, const std::string& contact,
            int triageLevel, bool isInPatient = false);

    // Polymorphism: Override pure virtual from Person
    void displayProfile() const override;

    // Billing polymorphism: in-patient vs out-patient
    double calculateBill() const;

    // Getters
    int         getTriageLevel()     const { return triageLevel; }
    bool        getIsDischarged()    const { return isDischarged; }
    bool        getIsInPatient()     const { return isInPatient; }
    double      getDailyRate()       const { return dailyRate; }
    int         getDaysAdmitted()    const { return daysAdmitted; }
    double      getAdditionalCharges() const { return additionalCharges; }
    std::string getAdmissionDate()   const { return admissionDate; }
    std::string getDischargeDate()   const { return dischargeDate; }
    const std::vector<std::string>& getMedicalHistory() const { return medicalHistory; }

    // Setters
    void setTriageLevel(int level)          { triageLevel = level; }
    void setIsDischarged(bool d)            { isDischarged = d; }
    void setIsInPatient(bool ip)            { isInPatient = ip; }
    void setDaysAdmitted(int days)          { daysAdmitted = days; }
    void setAdditionalCharges(double c)     { additionalCharges = c; }
    void setDischargeDate(const std::string& d) { dischargeDate = d; }
    void addMedicalHistory(const std::string& entry) { medicalHistory.push_back(entry); }

    std::string getTriageLevelString() const;
};
