package com.lexigram.app.controller;

import com.lexigram.app.dto.UserPrivacySettingsDTO;
import com.lexigram.app.service.UserPrivacySettingsService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/privacy")
public class UserPrivacySettingsController {

  private final UserPrivacySettingsService userPrivacySettingsService;

  @Autowired
  public UserPrivacySettingsController(UserPrivacySettingsService service) {
    this.userPrivacySettingsService = service;
  }

  @GetMapping
  public ResponseEntity<UserPrivacySettingsDTO> getPrivacySettings(HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(401).build();

    Optional<UserPrivacySettingsDTO> settings = userPrivacySettingsService.findPrivacySettings(userId);
    if (settings.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(settings.get());
  }

  @PutMapping
  public ResponseEntity<UserPrivacySettingsDTO> updatePrivacySettings(HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(401).build();

    Optional<UserPrivacySettingsDTO> updated = userPrivacySettingsService.changePrivacySettings(userId);
    if (updated.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(updated.get());
  }

}
