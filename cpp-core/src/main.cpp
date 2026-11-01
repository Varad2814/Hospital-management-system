// main.cpp — C++ engine entry point
// Reads a single JSON command from stdin, writes JSON response to stdout.
// Node.js spawns this as a child process per request.
#include "../include/HospitalEngine.h"
#include <iostream>
#include <string>
#include <sstream>

int main() {
    // Read entire stdin as the command JSON
    std::ostringstream buffer;
    buffer << std::cin.rdbuf();
    std::string input = buffer.str();

    if (input.empty()) {
        std::cout << "{\"status\":\"error\",\"message\":\"No input received\"}" << std::endl;
        return 1;
    }

    HospitalEngine engine;
    std::string response = engine.processCommand(input);
    std::cout << response << std::endl;
    return 0;
}
