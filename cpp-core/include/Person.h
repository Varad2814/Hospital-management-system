#pragma once
#include <string>
#include <iostream>

// Abstract Base Class - OOP: Abstraction, Inheritance root
class Person {
protected:
    std::string id;
    std::string name;
    int age;
    std::string gender;
    std::string contact;

public:
    // Constructor overloading: Quick registration
    Person(const std::string& id, const std::string& name);

    // Full registration
    Person(const std::string& id, const std::string& name, int age,
           const std::string& gender, const std::string& contact);

    // Virtual destructor for proper polymorphic cleanup
    virtual ~Person() = default;

    // Pure virtual function - enforces polymorphism
    virtual void displayProfile() const = 0;

    // Getters (Encapsulation)
    std::string getId()      const { return id; }
    std::string getName()    const { return name; }
    int         getAge()     const { return age; }
    std::string getGender()  const { return gender; }
    std::string getContact() const { return contact; }

    // Setters
    void setName(const std::string& n)    { name = n; }
    void setAge(int a)                     { age = a; }
    void setGender(const std::string& g)  { gender = g; }
    void setContact(const std::string& c) { contact = c; }
};
