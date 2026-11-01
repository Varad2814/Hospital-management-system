#include "../include/QueueManager.h"
#include "../include/HospitalExceptions.h"
#include <vector>
#include <algorithm>
#include <ctime>
#include <sstream>
#include <iomanip>

// ── Helpers ──────────────────────────────────────────────────────────────────
static std::string timestamp() {
    std::time_t t = std::time(nullptr);
    std::tm* tm_ptr = std::localtime(&t);
    std::ostringstream oss;
    oss << std::put_time(tm_ptr, "%H:%M:%S");
    return oss.str();
}

void QueueManager::logActivity(const std::string& message) {
    activityLog.push_back("[" + timestamp() + "] " + message);
    // Keep last 200 entries
    if (activityLog.size() > 200)
        activityLog.erase(activityLog.begin());
}

// ── Emergency Queue ───────────────────────────────────────────────────────────
void QueueManager::addToEmergencyQueue(std::shared_ptr<Patient> patient) {
    emergencyQueue.push(patient);
    logActivity("EMERGENCY QUEUE: Added " + patient->getName() +
                " [Triage: " + patient->getTriageLevelString() + "]");
}

std::shared_ptr<Patient> QueueManager::admitNextEmergencyPatient() {
    if (emergencyQueue.empty())
        throw EmptyQueueException("Emergency Queue");

    auto patient = emergencyQueue.top();
    emergencyQueue.pop();
    logActivity("ADMITTED: " + patient->getName() +
                " [Triage: " + patient->getTriageLevelString() + "]");
    return patient;
}

// Snapshot of priority queue contents (highest priority first)
std::vector<std::shared_ptr<Patient>> QueueManager::peekEmergencyQueue() const {
    // Copy the queue to a vector in priority order
    auto tempQueue = emergencyQueue;   // copy
    std::vector<std::shared_ptr<Patient>> result;
    while (!tempQueue.empty()) {
        result.push_back(tempQueue.top());
        tempQueue.pop();
    }
    return result;
}

int QueueManager::getEmergencyQueueSize() const {
    return static_cast<int>(emergencyQueue.size());
}

// ── Routine Queue ─────────────────────────────────────────────────────────────
void QueueManager::addToRoutineQueue(std::shared_ptr<Patient> patient) {
    routineQueue.push(patient);
    logActivity("ROUTINE QUEUE: Added " + patient->getName());
}

std::shared_ptr<Patient> QueueManager::processNextRoutineAppointment() {
    if (routineQueue.empty())
        throw EmptyQueueException("Routine Queue");

    auto patient = routineQueue.front();
    routineQueue.pop();
    logActivity("ROUTINE PROCESSED: " + patient->getName());
    return patient;
}

int QueueManager::getRoutineQueueSize() const {
    return static_cast<int>(routineQueue.size());
}
