package com.healthtrackpro;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthtrackpro.dto.request.LoginRequest;
import com.healthtrackpro.dto.request.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerShouldReturn201WithTokens() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test User");
        req.setEmail("testuser" + System.currentTimeMillis() + "@example.com");
        req.setPassword("Password1");
        req.setAge(25);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void loginWithInvalidCredentialsShouldReturn401() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("nonexistent@example.com");
        req.setPassword("WrongPass1");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerWithInvalidEmailShouldReturn400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test");
        req.setEmail("not-an-email");
        req.setPassword("Password1");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithWeakPasswordShouldReturn400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test");
        req.setEmail("test@test.com");
        req.setPassword("weak"); // too short, no uppercase

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
