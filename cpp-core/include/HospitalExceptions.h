#pragma once
#include <stdexcept>
#include <string>

// Custom exception hierarchy — OOP: Inheritance for exception types

class HospitalException : public std::runtime_error {
public:
    explicit HospitalException(const std::string& msg)
        : std::runtime_error("HospitalException: " + msg) {}
};

class InvalidPatientIdException : public HospitalException {
public:
    explicit InvalidPatientIdException(const std::string& id)
        : HospitalException("Invalid or non-existent Patient ID: " + id) {}
};

class DuplicatePatientException : public HospitalException {
public:
    explicit DuplicatePatientException(const std::string& id)
        : HospitalException("Patient with ID already exists: " + id) {}
};

class EmptyQueueException : public HospitalException {
public:
    explicit EmptyQueueException(const std::string& queueName)
        : HospitalException("Queue is empty: " + queueName) {}
};

class DoctorUnavailableException : public HospitalException {
public:
    explicit DoctorUnavailableException(const std::string& doctorName)
        : HospitalException("Doctor is currently unavailable: " + doctorName) {}
};

class InvalidTriageLevelException : public HospitalException {
public:
    explicit InvalidTriageLevelException(int level)
        : HospitalException("Invalid triage level (must be 1-3): " +
                            std::to_string(level)) {}
};

class FileIOException : public HospitalException {
public:
    explicit FileIOException(const std::string& filename)
        : HospitalException("File I/O error for: " + filename) {}
};
