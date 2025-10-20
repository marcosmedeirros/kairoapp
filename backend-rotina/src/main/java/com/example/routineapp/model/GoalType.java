package com.example.routineapp.model;

public enum GoalType {
    WEEKLY("weekly"),
    MONTHLY("monthly"),
    YEARLY("yearly");

    private final String value;
    GoalType(String value) {
        this.value = value;
    }
    public String getValue() {
        return value;
    }
    public static GoalType fromString(String str) {
        for (GoalType type : values()) {
            if (type.value.equalsIgnoreCase(str)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Tipo de meta inválido: " + str);
    }
}