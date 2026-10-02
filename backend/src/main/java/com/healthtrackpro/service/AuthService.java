package com.healthtrackpro.service;

import com.healthtrackpro.dto.request.LoginRequest;
import com.healthtrackpro.dto.request.RegisterRequest;
import com.healthtrackpro.dto.response.AuthResponse;
import com.healthtrackpro.exception.EmailAlreadyExistsException;
import com.healthtrackpro.exception.UnauthorizedException;
import com.healthtrackpro.model.User;
import com.healthtrackpro.model.enums.UserRole;
import com.healthtrackpro.repository.UserRepository;
import com.healthtrackpro.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final ActivityLogService activityLogService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
            .fullName(request.getFullName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .age(request.getAge())
            .gender(request.getGender())
            .height(request.getHeight())
            .weight(request.getWeight())
            .role(UserRole.USER)
            .isActive(true)
            .build();

        userRepository.save(user);
        activityLogService.log(user, "REGISTER", "User registered successfully");

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return buildAuthResponse(user, userDetails);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        activityLogService.log(user, "LOGIN", "User logged in");

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        return buildAuthResponse(user, userDetails);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtUtil.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!jwtUtil.isTokenValid(refreshToken, userDetails)) {
            throw new UnauthorizedException("Invalid refresh token");
        }
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("User not found"));
        return buildAuthResponse(user, userDetails);
    }

    private AuthResponse buildAuthResponse(User user, UserDetails userDetails) {
        return AuthResponse.builder()
            .accessToken(jwtUtil.generateAccessToken(userDetails))
            .refreshToken(jwtUtil.generateRefreshToken(userDetails))
            .tokenType("Bearer")
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .build();
    }
}
