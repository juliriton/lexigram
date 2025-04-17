package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.service.ExperienceService;
import com.lexigram.app.service.SuggestionService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

  @PostMapping(value = "/experience", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ExperienceDTO> postExperience(
      @RequestPart("post") @Valid PostExperienceDTO postExperienceDTO,
      @RequestPart(value = "file", required = true) MultipartFile file,
      HttpSession session) throws IOException {

    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    ExperienceDTO experienceDTO = experienceService.createExperience(id, postExperienceDTO, file);
    return ResponseEntity.ok(experienceDTO);
  }


  @PostMapping("/suggestion")
  public ResponseEntity<SuggestionDTO> postSuggestion(@Valid @ModelAttribute PostSuggestionDTO postSuggestionDTO, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    SuggestionDTO suggestionDTO = suggestionService.createSuggestion(id, postSuggestionDTO);

    return ResponseEntity.ok(suggestionDTO);
  }

}
