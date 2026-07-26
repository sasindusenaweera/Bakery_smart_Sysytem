package com.bakery.service;

import com.bakery.dto.UserDTO;
import com.bakery.entity.User;
import com.bakery.entity.UserRole;
import com.bakery.exception.ResourceNotFoundException;
import com.bakery.exception.UserAlreadyExistsException;
import com.bakery.repository.UserRepository;
import com.bakery.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userDetailsService.loadUserByUsername(username);
    }

    @Transactional
    @NonNull
    public UserDTO.Response registerUser(@NonNull UserDTO.Create createDTO) {
        if (userRepository.existsByUsername(createDTO.username())) {
            throw new UserAlreadyExistsException("Username already exists: " + createDTO.username());
        }
        if (userRepository.existsByEmail(createDTO.email())) {
            throw new UserAlreadyExistsException("Email already exists: " + createDTO.email());
        }

        User user = User.builder()
                .username(createDTO.username())
                .email(createDTO.email())
                .password(passwordEncoder.encode(createDTO.password()))
                .role(createDTO.role())
                .active(true)
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @NonNull
    public String loginUser(@NonNull String username, @NonNull String password) {
        UserDetails userDetails;
        try {
            userDetails = userDetailsService.loadUserByUsername(username);
        } catch (UsernameNotFoundException e) {
            throw new BadCredentialsException("Invalid username or password");
        }
        
        if (!userDetails.isEnabled()) {
            throw new BadCredentialsException("User account is disabled");
        }
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return jwtService.generateToken(user);
    }

    public List<UserDTO.Response> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @NonNull
    public UserDTO.Response getUserById(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    @NonNull
    public UserDTO.Response getUserByUsername(@NonNull String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return mapToResponse(user);
    }

    public List<UserDTO.Response> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    @NonNull
    public UserDTO.Response updateUser(@NonNull Long id, @NonNull UserDTO.Create updateDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getUsername().equals(updateDTO.username()) 
                && userRepository.existsByUsername(updateDTO.username())) {
            throw new UserAlreadyExistsException("Username already exists: " + updateDTO.username());
        }

        if (!user.getEmail().equals(updateDTO.email()) 
                && userRepository.existsByEmail(updateDTO.email())) {
            throw new UserAlreadyExistsException("Email already exists: " + updateDTO.email());
        }

        user.setUsername(updateDTO.username());
        user.setEmail(updateDTO.email());
        user.setRole(updateDTO.role());

        if (updateDTO.password() != null && !updateDTO.password().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateDTO.password()));
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Transactional
    @NonNull
    public UserDTO.Response createUser(@NonNull UserDTO.Create createDTO) {
        return registerUser(createDTO);
    }

    @Transactional
    public void deactivateUser(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void activateUser(@NonNull Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(@NonNull Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @NonNull
    private UserDTO.Response mapToResponse(@NonNull User user) {
        return new UserDTO.Response(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getActive()
        );
    }
}
