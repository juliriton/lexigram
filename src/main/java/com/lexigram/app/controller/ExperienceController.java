package com.lexigram.app.controller;
import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.ForkExperienceDTO;
import com.lexigram.app.dto.PostCommentDTO;
import com.lexigram.app.service.ExperienceService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me")
public class ExperienceController {

  @Autowired
  private ExperienceService experienceService;

  public ExperienceController(ExperienceService experienceService) {
    this.experienceService = experienceService;
  }

  @PutMapping("/{uuid}/resonate")
  public ResponseEntity<ExperienceDTO> resonateExperience(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.resonateExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();
  }

  @PutMapping("/{uuid}/unresonate")
  public ResponseEntity<ExperienceDTO> unResonateExperience(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.unResonateExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();


  }

  @PutMapping("/{uuid}/comment")
  public ResponseEntity<ExperienceDTO> commentExperience(HttpSession session, @PathVariable UUID uuid, @RequestBody PostCommentDTO comment) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.commentExperience(id, uuid, comment);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @PutMapping("/{expUuid}/comment/{comUuid}")
  public ResponseEntity<ExperienceDTO> unCommentExperience(HttpSession session, @PathVariable UUID expUuid, @PathVariable UUID comUuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.uncCommentExperience(id, expUuid, comUuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @PutMapping("/{uuid}/save")
  public ResponseEntity<ExperienceDTO> saveExperience(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.saveExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();
  }

  @PutMapping("/{uuid}/unSave")
  public ResponseEntity<ExperienceDTO> unSaveExperience(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.unSaveExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @PutMapping("/{uuid}/fork")
  public ResponseEntity<ExperienceDTO> forkExperience(HttpSession session, @PathVariable UUID uuid, @RequestBody ForkExperienceDTO fork) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.forkExperience(id, uuid, fork);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @GetMapping("/{uuid}/share")
  public ResponseEntity<String> getExperienceLink(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    String postLink = experienceService.getExperienceLink(uuid);

    return ResponseEntity.ok(postLink);

  }

}