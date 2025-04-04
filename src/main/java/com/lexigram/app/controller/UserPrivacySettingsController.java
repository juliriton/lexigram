package com.lexigram.app.controller;

import com.lexigram.app.dto.UserPrivacySettingsDTO;
import com.lexigram.app.service.UserPrivacySettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users/{userId}/privacy")
public class UserPrivacySettingsController {

  private final UserPrivacySettingsService userPrivacySettingsService;

  @Autowired
  public UserPrivacySettingsController(UserPrivacySettingsService userPrivacySettingsService) {
    this.userPrivacySettingsService = userPrivacySettingsService;
  }

  @GetMapping()
  public ResponseEntity<UserPrivacySettingsDTO> getPrivacySettings(@PathVariable Long userId) {
    Optional<UserPrivacySettingsDTO> settings = userPrivacySettingsService.findPrivacySettings(userId);

    if (settings.isPresent()) {
      return ResponseEntity.ok(settings.get());
    }
    return ResponseEntity.notFound().build();
  }

  @PutMapping()
  public ResponseEntity<UserPrivacySettingsDTO> updatePrivacySettings(@PathVariable Long userId) {
    Optional<UserPrivacySettingsDTO> oldSettings = userPrivacySettingsService.findPrivacySettings(userId);

    if (oldSettings.isPresent()) {
      Optional<UserPrivacySettingsDTO> newSettings = userPrivacySettingsService.changePrivacySettings(userId);
      return ResponseEntity.ok(newSettings.get());
    }
    return ResponseEntity.notFound().build();
  }

}
