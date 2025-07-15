package com.lexigram.app.controller;

import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.SuggestionDTO;
import com.lexigram.app.model.user.User;
import com.lexigram.app.repository.UserRepository;
import com.lexigram.app.service.ExperienceService;
import com.lexigram.app.service.SuggestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/public")
public class PublicPostController {

  private final ExperienceService experienceService;
  private final SuggestionService suggestionService;
  private final UserRepository userRepository;

  @Autowired
  public PublicPostController(ExperienceService experienceService,
                              SuggestionService suggestionService,
                              UserRepository userRepository) {
    this.experienceService = experienceService;
    this.suggestionService = suggestionService;
    this.userRepository = userRepository;
  }

  @GetMapping("/experience/{uuid}")
  public ResponseEntity<?> getPublicExperience(@PathVariable UUID uuid) {
    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.getPublicExperienceByUuid(uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO dto = optionalExperienceDTO.get();
      // Check if user is public
      Optional<User> userOpt = userRepository.findByUuid(dto.getUser().getUuid());
      if (userOpt.isPresent() && userOpt.get().getUserPrivacySettings().getVisibility()) {
        return ResponseEntity.ok(dto);
      } else if (userOpt.isPresent()) {
        // User exists but post is private, return user info for redirect
        Map<String, Object> response = new HashMap<>();
        response.put("private", true);
        response.put("userId", userOpt.get().getUuid());
        response.put("username", userOpt.get().getUsername());
        return ResponseEntity.status(403).body(response);
      }
    }

    return ResponseEntity.status(404).build();
  }

  @GetMapping("/suggestion/{uuid}")
  public ResponseEntity<?> getPublicSuggestion(@PathVariable UUID uuid) {
    Optional<SuggestionDTO> optionalSuggestionDTO = suggestionService.getPublicSuggestionByUuid(uuid);

    if (optionalSuggestionDTO.isPresent()) {
      SuggestionDTO dto = optionalSuggestionDTO.get();
      // Check if user is public
      Optional<User> userOpt = userRepository.findByUuid(dto.getUser().getUuid());
      if (userOpt.isPresent() && userOpt.get().getUserPrivacySettings().getVisibility()) {
        return ResponseEntity.ok(dto);
      } else if (userOpt.isPresent()) {
        // User exists but post is private, return user info for redirect
        Map<String, Object> response = new HashMap<>();
        response.put("private", true);
        response.put("userId", userOpt.get().getUuid());
        response.put("username", userOpt.get().getUsername());
        return ResponseEntity.status(403).body(response);
      }
    }

    return ResponseEntity.status(404).build();
  }
}