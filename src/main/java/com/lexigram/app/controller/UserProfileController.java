package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.service.ExperienceService;
import com.lexigram.app.service.SuggestionService;
import com.lexigram.app.service.UserProfileService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/profile")
public class UserProfileController {

  private final ExperienceService experienceService;
  private final SuggestionService suggestionService;
  @Value("${lexigram.upload.dir}")
  private String uploadDir;
  private final UserProfileService userProfileService;

  @Autowired
  public UserProfileController(UserProfileService userProfileService, ExperienceService experienceService, SuggestionService suggestionService) {
    this.userProfileService = userProfileService;
    this.experienceService = experienceService;
    this.suggestionService = suggestionService;
  }

  @GetMapping
  public ResponseEntity<UserProfileDTO> getProfile(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserProfileDTO> profile = userProfileService.getProfile(id);
    if (profile.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(profile.get());
  }

  @PutMapping("/edit/biography")
  public ResponseEntity<String> updateBiography(HttpSession session,
                                                @RequestBody UserUpdateProfileBioDTO dto) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserProfileDTO> updated = userProfileService.updateUserProfileBio(id, dto);
    if (updated.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(updated.get().getBiography());
  }

  @PutMapping("/edit/experience/{uuid}/quote")
  public ResponseEntity<ExperienceDTO> updateExperienceQuote(
      HttpSession session,
      @PathVariable UUID uuid,
      @Valid @RequestBody UpdateExperienceQuoteDTO dto) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> updated = experienceService.updateExperienceQuote(uuid, dto);
    if (updated.isEmpty()) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(updated.get());
  }


  @PutMapping("/edit/experience/{uuid}/reflection")
  public ResponseEntity<ExperienceDTO> updateExperienceReflection(
      HttpSession session,
      @PathVariable UUID uuid,
      @Valid @RequestBody UpdateExperienceReflectionDTO dto) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> updated = experienceService.updateExperienceReflection(uuid, dto);
    if (updated.isEmpty()) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(updated.get());
  }

  @PutMapping("/edit/experience/{uuid}/tags")
  public ResponseEntity<ExperienceDTO> updateExperienceTags(
      HttpSession session,
      @PathVariable UUID uuid,
      @Valid @RequestBody UpdateExperienceTagDTO dto) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> updated = experienceService.updateExperienceTag(uuid, dto);
    if (updated.isEmpty()) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(updated.get());
  }

  @PutMapping("/edit/experience/{uuid}/mentions")
  public ResponseEntity<?> updateExperienceMentions(
      HttpSession session,
      @PathVariable UUID uuid,
      @Valid @RequestBody UpdateExperienceMentionsDTO dto) {

    Long userId = (Long) session.getAttribute("user");
    if (userId == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    try {
      Optional<ExperienceDTO> updated = experienceService.updateExperienceMentions(uuid, dto);

      if (updated.isEmpty()) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Experiencia no encontrada con UUID: " + uuid));
      }

      return ResponseEntity.ok(updated.get());

    } catch (UserNotFoundException e) {
      return ResponseEntity
          .status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));

    } catch (Exception e) {
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Error al procesar la solicitud"));
    }
  }


  @PostMapping("/edit/profile-picture")
  public ResponseEntity<String> updateProfilePicture(HttpSession session,
                                                     @RequestParam MultipartFile file) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    if (!"image/jpeg".equalsIgnoreCase(file.getContentType())) {
        return ResponseEntity
            .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
            .body("Only JPG/JPEG images are allowed");
      }

      try {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        File destination = new File(uploadDir + File.separator + fileName);
        destination.getParentFile().mkdirs();
        file.transferTo(destination);

        String relativePath = "/images/" + fileName;
        userProfileService.updateProfilePicture(id, relativePath);

        return ResponseEntity.ok("Imagen subida correctamente.");
      } catch (IOException e) {
        return ResponseEntity.status(500).body("Error al subir imagen: " + e.getMessage());
      }
    }

    @GetMapping("/posts")
    public ResponseEntity<UserPostsDTO> getAllPosts(HttpSession session) {
      Long id = (Long) session.getAttribute("user");
      if (id == null) return ResponseEntity.status(401).build();

      return ResponseEntity.ok(userProfileService.getAllUserPosts(id));
    }

    @GetMapping("/posts/experiences")
    public ResponseEntity<Set<ExperienceDTO>> getAllExperiences(HttpSession session) {
      Long id = (Long) session.getAttribute("user");
      if (id == null) return ResponseEntity.status(401).build();

      return ResponseEntity.ok(userProfileService.getAllUserExperiences(id));
    }

    @GetMapping("/posts/suggestions")
    public ResponseEntity<Set<SuggestionDTO>> getAllSuggestions(HttpSession session) {
      Long id = (Long) session.getAttribute("user");
      if (id == null) return ResponseEntity.status(401).build();

      return ResponseEntity.ok(userProfileService.getAllUserSuggestions(id));
    }

    @GetMapping("/followers")
    public ResponseEntity<Set<ConnectionDTO>> getFollowers(HttpSession session) {
      Long id = (Long) session.getAttribute("user");
      if (id == null) return ResponseEntity.status(401).build();

      return ResponseEntity.ok(userProfileService.getFollowers(id));
    }

    @GetMapping("/following")
    public ResponseEntity<Set<ConnectionDTO>> getFollowing(HttpSession session) {
      Long id = (Long) session.getAttribute("user");
      if (id == null) return ResponseEntity.status(401).build();

      return ResponseEntity.ok(userProfileService.getFollowing(id));
    }

    @PostMapping("/posts/delete/suggestions/{suggestionUuid}")
    public ResponseEntity<Void> deleteSuggestion(HttpSession session, @PathVariable UUID suggestionUuid) {
      Long id = (Long) session.getAttribute("user");
      if (id == null) return ResponseEntity.status(401).build();

      if (suggestionService.deleteSuggestion(suggestionUuid, id)) {
        return ResponseEntity.noContent().build();
      }
      return ResponseEntity.notFound().build();
    }

    @PostMapping("/posts/delete/experiences/{experienceUuid}")
    public ResponseEntity<Void> deleteExperience(HttpSession session, @PathVariable UUID experienceUuid) {
      Long id = (Long) session.getAttribute("user");
      if (id == null) return ResponseEntity.status(401).build();
      if (experienceService.deleteExperience(experienceUuid, id)) {
        return ResponseEntity.noContent().build();
      }
      return ResponseEntity.notFound().build();
    }

  }
