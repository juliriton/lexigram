package com.lexigram.app.controller;

import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.PostExperienceDTO;
import com.lexigram.app.dto.SuggestionDTO;
import com.lexigram.app.service.SuggestionService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me")
public class SuggestionController {

  private final SuggestionService suggestionService;

  @Autowired
  public SuggestionController(SuggestionService suggestionService) {
    this.suggestionService = suggestionService;
  }

  @PostMapping("/suggestion/{uuid}/resonate")
  public ResponseEntity<SuggestionDTO> resonateSuggestion(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<SuggestionDTO> optionalSuggestionDTO = suggestionService.resonateSuggestion(id, uuid);

    if (optionalSuggestionDTO.isPresent()) {
      SuggestionDTO suggestionDTO = optionalSuggestionDTO.get();
      return ResponseEntity.ok(suggestionDTO);
    }

    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("/suggestion/{uuid}/un-resonate")
  public ResponseEntity<SuggestionDTO> unResonateSuggestion(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<SuggestionDTO> optionalSuggestionDTO = suggestionService.unResonateSuggestion(id, uuid);

    if (optionalSuggestionDTO.isPresent()) {
      SuggestionDTO suggestionDTO = optionalSuggestionDTO.get();
      return ResponseEntity.ok(suggestionDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @PostMapping(value = "/suggestion/{uuid}/reply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<SuggestionDTO> replySuggestion(HttpSession session,
                                                       @PathVariable UUID uuid,
                                                       @RequestPart("post") PostExperienceDTO experienceDTO,
                                                       @RequestPart(value = "file", required = true) MultipartFile file) throws IOException {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<SuggestionDTO> optionalSuggestionDTO = suggestionService.replySuggestion(id, uuid, experienceDTO, file);

    if (optionalSuggestionDTO.isPresent()) {
      SuggestionDTO suggestionDTO = optionalSuggestionDTO.get();
      return ResponseEntity.ok(suggestionDTO);
    }

    return ResponseEntity.status(401).build();
  }

  @PostMapping("/suggestion/{uuid}/save")
  public ResponseEntity<SuggestionDTO> saveSuggestion(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<SuggestionDTO> optionalSuggestionDTO = suggestionService.saveSuggestion(id, uuid);

    if (optionalSuggestionDTO.isPresent()) {
      SuggestionDTO suggestionDTO = optionalSuggestionDTO.get();
      return ResponseEntity.ok(suggestionDTO);
    }

    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("/suggestion/{uuid}/un-save")
  public ResponseEntity<SuggestionDTO> unSaveSuggestion(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<SuggestionDTO> optionalSuggestionDTO = suggestionService.unSaveSuggestion(id, uuid);

    if (optionalSuggestionDTO.isPresent()) {
      SuggestionDTO suggestionDTO = optionalSuggestionDTO.get();
      return ResponseEntity.ok(suggestionDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @GetMapping("/suggestion/{uuid}/share")
  public ResponseEntity<String> getSuggestionLink(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    String postLink = suggestionService.getSuggestionLink(uuid);

    return ResponseEntity.ok(postLink);

  }

  @GetMapping("/suggestion/{uuid}/replies")
  public ResponseEntity<Set<ExperienceDTO>> getSuggestionReplies(HttpSession session,
                                                                 @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Set<ExperienceDTO> experiences = suggestionService.getAllReplies(id, uuid);

    return ResponseEntity.ok(experiences);
  }

}
