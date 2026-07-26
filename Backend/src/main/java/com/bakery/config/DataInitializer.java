package com.bakery.config;

import com.bakery.entity.User;
import com.bakery.entity.UserRole;
import com.bakery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Initializing default users...");
            
            List<User> defaultUsers = Arrays.asList(
                User.builder()
                    .username("Owner")
                    .email("owner@gmail.com")
                    .password(passwordEncoder.encode("Owner123"))
                    .role(UserRole.OWNER)
                    .active(true)
                    .build(),
                User.builder()
                    .username("Cashier")
                    .email("cashier@gmail.com")
                    .password(passwordEncoder.encode("Cashier123"))
                    .role(UserRole.CASHIER)
                    .active(true)
                    .build(),
                User.builder()
                    .username("Baker")
                    .email("baker@gmail.com")
                    .password(passwordEncoder.encode("Baker123"))
                    .role(UserRole.BAKER)
                    .active(true)
                    .build(),
                User.builder()
                    .username("Storekeeper")
                    .email("storekeeper@gmail.com")
                    .password(passwordEncoder.encode("Storekeeper123"))
                    .role(UserRole.STOREKEEPER)
                    .active(true)
                    .build()
            );

            userRepository.saveAll(defaultUsers);
            log.info("Default users created successfully!");
        } else {
            log.info("Users already exist, skipping initialization.");
        }
    }
}
