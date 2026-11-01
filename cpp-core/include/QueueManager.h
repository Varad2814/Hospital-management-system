#pragma once
#include "Patient.h"
#include <queue>
#include <vector>
#include <string>
#include <memory>

// Custom comparator for priority queue (DS: std::priority_queue)
// Lower triage number = higher priority (1=Critical comes first)
struct ComparePatientPriority {
    bool operator()(const std::shared_ptr<Patient>& a,
                    const std::shared_ptr<Patient>& b) const {
        // Higher triage level = lower priority in queue
        if (a->getTriageLevel() != b->getTriageLevel())
            return a->getTriageLevel() > b->getTriageLevel();
        // Tie-break: preserve insertion order is not possible in heap,
        // so we use ID lexicographic order as stable secondary sort
        return a->getId() > b->getId();
    }
};

// Manages both Emergency Priority Queue and Routine Appointment Queue
// SOLID: Single Responsibility — only manages queue operations
class QueueManager {
private:
    // DS: std::priority_queue for emergency triage
    std::priority_queue<
        std::shared_ptr<Patient>,
        std::vector<std::shared_ptr<Patient>>,
        ComparePatientPriority
    > emergencyQueue;

    // DS: std::queue for routine appointments (FIFO)
    std::queue<std::shared_ptr<Patient>> routineQueue;

    // History log (DS: std::vector)
    std::vector<std::string> activityLog;

    void logActivity(const std::string& message);

public:
    QueueManager() = default;

    // Emergency queue operations
    void addToEmergencyQueue(std::shared_ptr<Patient> patient);
    std::shared_ptr<Patient> admitNextEmergencyPatient();
    std::vector<std::shared_ptr<Patient>> peekEmergencyQueue() const;
    int getEmergencyQueueSize() const;

    // Routine queue operations
    void addToRoutineQueue(std::shared_ptr<Patient> patient);
    std::shared_ptr<Patient> processNextRoutineAppointment();
    int getRoutineQueueSize() const;

    // Activity log
    const std::vector<std::string>& getActivityLog() const { return activityLog; }
    void clearLog() { activityLog.clear(); }
};
