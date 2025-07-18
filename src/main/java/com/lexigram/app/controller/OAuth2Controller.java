package com.lexigram.app.controller;

import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserPrivacySettings;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.repository.UserPrivacySettingsRepository;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
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

  @GetMapping("/login/success")
  public void oauth2Success(
      @AuthenticationPrincipal OAuth2User principal,
      HttpSession session,
      HttpServletResponse response) throws IOException {

    System.out.println("OAuth2 success endpoint called");
    System.out.println("Frontend URL: " + frontendUrl);

    if (principal == null) {
      System.out.println("Principal is null, redirecting to login with error");
      response.sendRedirect(frontendUrl + "/login?error=oauth_failed");
      return;
    }

    Map<String, Object> attributes = principal.getAttributes();
    String email = (String) attributes.get("email");
    String name = (String) attributes.get("name");
    String baseUsername = email != null ? email.split("@")[0] : null;
    String picture = (String) attributes.get("picture");

    System.out.println("OAuth2 user email: " + email);
    System.out.println("OAuth2 user name: " + name);

    if (email == null || baseUsername == null) {
      System.out.println("Invalid OAuth2 data, redirecting with error");
      response.sendRedirect(frontendUrl + "/login?error=invalid_data");
      return;
    }

    try {
      Optional<User> existingUserByEmail = userRepository.findByEmail(email);
      User user;

      if (existingUserByEmail.isPresent()) {
        // User exists with this email (OAuth returning user)
        user = existingUserByEmail.get();
        System.out.println("Existing user found: " + user.getUsername());
      } else {
        // New OAuth user - check for username conflicts
        String finalUsername = baseUsername;
        int suffix = 1;

        // Keep trying until we find an available username
        while (userRepository.findByUsername(finalUsername).isPresent()) {
          finalUsername = baseUsername + suffix;
          suffix++;
        }

        System.out.println("Creating new user with username: " + finalUsername);

        // Create new user
        user = new User();
        user.setEmail(email);
        user.setUsername(finalUsername);
        user.setPassword(""); // No password for OAuth users
        user = userRepository.save(user);

        // Create profile - truncate picture URL if necessary
        UserProfile profile = new UserProfile(user);
        profile.setBiography("No bio yet — still searching for the right words.");

        // Handle potentially long profile picture URLs
        String profilePictureUrl = "/images/default-profile.png";
        if (picture != null && !picture.isEmpty()) {
          profilePictureUrl = picture.length() > 255 ? picture.substring(0, 255) : picture;
        }
        profile.setProfilePictureUrl(profilePictureUrl);

        userProfileRepository.save(profile);

        // Create privacy settings
        UserPrivacySettings privacySettings = new UserPrivacySettings(user);
        userPrivacySettingsRepository.save(privacySettings);
      }

      // Set session
      session.setAttribute("user", user.getId());
      System.out.println("Session set for user ID: " + user.getId());

      // Instead of redirecting to /oauth-callback, redirect directly to home with success parameter
      String redirectUrl = frontendUrl + "/?oauth=success";
      System.out.println("Redirecting to: " + redirectUrl);
      response.sendRedirect(redirectUrl);

    } catch (Exception e) {
      System.err.println("Error in OAuth2 success handler: " + e.getMessage());
      e.printStackTrace();
      response.sendRedirect(frontendUrl + "/login?error=server_error");
    }
  }

  @GetMapping("/success")
  public ResponseEntity<UserDTO> getOAuthUser(HttpSession session) {
    System.out.println("OAuth2 success API endpoint called");

    Long userId = (Long) session.getAttribute("user");
    System.out.println("Session user ID: " + userId);

    if (userId == null) {
      System.out.println("No user ID in session");
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    Optional<User> userOpt = userRepository.findById(userId);
    if (userOpt.isEmpty()) {
      System.out.println("User not found for ID: " + userId);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    User user = userOpt.get();
    UserDTO userDTO = new UserDTO(
        user.getId(),
        user.getUuid(),
        user.getUsername(),
        user.getEmail()
    );

    System.out.println("Returning user data: " + userDTO.getUsername());
    return ResponseEntity.ok(userDTO);
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