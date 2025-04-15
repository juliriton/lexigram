package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.service.ExperienceService;
import com.lexigram.app.service.SuggestionService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/post")
public class PostCreationController {

  private ExperienceService experienceService;
  private SuggestionService suggestionService;

  @Autowired
  public PostCreationController(ExperienceService experienceService, SuggestionService suggestionService) {
    this.experienceService = experienceService;
    this.suggestionService = suggestionService;
  }

  @PostMapping("/experience")
  public ResponseEntity<ExperienceDTO> postExperience(@Valid @RequestBody PostExperienceDTO postExperienceDTO, HttpSession session) throws IOException {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    ExperienceDTO experienceDTO = experienceService.createExperience(id, postExperienceDTO);

    return ResponseEntity.ok(experienceDTO);
  }

  @PostMapping("/suggestion")
  public ResponseEntity<SuggestionDTO> postSuggestion(@Valid @RequestBody PostSuggestionDTO postSuggestionDTO, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    SuggestionDTO suggestionDTO = suggestionService.createSuggestion(id, postSuggestionDTO);

    return ResponseEntity.ok(suggestionDTO);
  }

}
