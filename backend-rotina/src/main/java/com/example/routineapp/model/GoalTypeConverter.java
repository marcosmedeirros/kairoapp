package com.example.routineapp.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class GoalTypeConverter implements AttributeConverter<GoalType, String> {
    @Override
    public String convertToDatabaseColumn(GoalType attribute) {
        if (attribute == null) return null;
        return attribute.getValue();
    }

    @Override
    public GoalType convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        try {
            return GoalType.fromString(dbData);
        } catch (Exception e) {
            // fallback: try matching enum names
            try {
                return GoalType.valueOf(dbData);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Unknown GoalType value: " + dbData);
            }
        }
    }
}

