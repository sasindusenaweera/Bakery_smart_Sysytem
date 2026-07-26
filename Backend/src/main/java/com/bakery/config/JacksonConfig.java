package com.bakery.config;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class JacksonConfig {

    private static final DateTimeFormatter FULL_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            builder.modules(new JavaTimeModule(), createCustomTimeModule());
            builder.featuresToDisable(
                SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
                DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES
            );
        };
    }

    private SimpleModule createCustomTimeModule() {
        SimpleModule module = new SimpleModule("CustomLocalDateTimeModule");
        
        module.addDeserializer(LocalDateTime.class, new JsonDeserializer<LocalDateTime>() {
            @Override
            public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
                String value = p.getValueAsString();
                if (value == null || value.isEmpty()) return null;
                
                try {
                    // Try ISO format first (2026-04-27T03:57:00.000Z)
                    if (value.contains("T")) {
                        value = value.replace("Z", "").replace("T", " ");
                        return LocalDateTime.parse(value, FULL_FORMATTER);
                    }
                    
                    // Try full format (2026-04-27 03:57:00)
                    if (value.length() > 10 && value.contains(" ")) {
                        return LocalDateTime.parse(value, FULL_FORMATTER);
                    }
                    
                    // If only date (2026-04-27)
                    if (value.length() == 10) {
                        return LocalDateTime.parse(value + " 00:00:00", FULL_FORMATTER);
                    }
                    
                    return LocalDateTime.parse(value, FULL_FORMATTER);
                } catch (DateTimeParseException e) {
                    return null;
                }
            }
        });
        
        return module;
    }
}