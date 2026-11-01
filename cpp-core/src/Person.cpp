#include "../include/Person.h"

// Quick registration constructor
Person::Person(const std::string& id, const std::string& name)
    : id(id), name(name), age(0), gender("Unknown"), contact("N/A") {}

// Full registration constructor
Person::Person(const std::string& id, const std::string& name, int age,
               const std::string& gender, const std::string& contact)
    : id(id), name(name), age(age), gender(gender), contact(contact) {}
