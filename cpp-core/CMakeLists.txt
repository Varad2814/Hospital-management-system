cmake_minimum_required(VERSION 3.14)
project(HospitalEngine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Output the binary to the backend's bin/ directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/../backend/bin")

file(GLOB SOURCES "src/*.cpp")

add_executable(hospital_engine ${SOURCES})

target_include_directories(hospital_engine PRIVATE include)

# Windows: create data dir
if(WIN32)
    target_compile_definitions(hospital_engine PRIVATE _WIN32)
endif()

# Enable warnings
if(MSVC)
    target_compile_options(hospital_engine PRIVATE /W3)
else()
    target_compile_options(hospital_engine PRIVATE -Wall -Wextra -O2)
endif()

message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Output dir: ${CMAKE_RUNTIME_OUTPUT_DIRECTORY}")
