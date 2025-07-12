package com.lexigram.app.controller;

import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserPrivacySettings;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.repository.UserPrivacySettingsRepository;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/oauth2")
public class OAuth2Controller {

  @Value("${lexigram.frontend.url:http://localhost:3000}")
  private String frontendUrl;

  private final UserRepository userRepository;
  private final UserPrivacySettingsRepository userPrivacySettingsRepository;
  private final UserProfileRepository userProfileRepository;

  @Autowired
  public OAuth2Controller(UserRepository userRepository,
                          UserPrivacySettingsRepository userPrivacySettingsRepository,
                          UserProfileRepository userProfileRepository) {
    this.userRepository = userRepository;
    this.userPrivacySettingsRepository = userPrivacySettingsRepository;
    this.userProfileRepository = userProfileRepository;
  }

  @GetMapping("/success")
  public ResponseEntity<UserDTO> oauth2Success(
      @AuthenticationPrincipal OAuth2User principal,
      HttpSession session) {

    if (principal == null) {
      return ResponseEntity.status(401).build();
    }

    Map<String, Object> attributes = principal.getAttributes();
    String email = (String) attributes.get("email");
    String name = (String) attributes.get("name");
    String baseUsername = email.split("@")[0];
    String picture = (String) attributes.get("picture");

    if (email == null || baseUsername == null) {
      return ResponseEntity.badRequest().build();
    }

    try {
      Optional<User> existingUserByEmail = userRepository.findByEmail(email);
      User user;

      if (existingUserByEmail.isPresent()) {
        // User exists with this email (OAuth returning user)
        user = existingUserByEmail.get();
      } else {
        // New OAuth user - check for username conflicts
        String finalUsername = baseUsername;
        int suffix = 1;

        // Keep trying until we find an available username
        while (userRepository.findByUsername(finalUsername).isPresent()) {
          finalUsername = baseUsername + suffix;
          suffix++;
        }

        // Create new user
        user = new User();
        user.setEmail(email);
        user.setUsername(finalUsername);
        user.setPassword(""); // No password for OAuth users
        user = userRepository.save(user);

        // Create profile
        UserProfile profile = new UserProfile(user);
        profile.setBiography("No bio yet — still searching for the right words.");
        profile.setProfilePictureUrl(picture != null ? picture : "/images/default-profile.png");
        userProfileRepository.save(profile);

        // Create privacy settings
        UserPrivacySettings privacySettings = new UserPrivacySettings(user);
        userPrivacySettingsRepository.save(privacySettings);
      }

      // Set session
      session.setAttribute("user", user.getId());

      // Create response DTO
      UserDTO userDTO = new UserDTO(
          user.getId(),
          user.getUuid(),
          user.getUsername(),
          user.getEmail()
      );

      return ResponseEntity.ok(userDTO);

    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @GetMapping("/check")
  public ResponseEntity<String> checkAuth(HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId != null) {
      return ResponseEntity.ok("Authenticated");
    }
    return ResponseEntity.status(401).body("Not authenticated");
  }
}