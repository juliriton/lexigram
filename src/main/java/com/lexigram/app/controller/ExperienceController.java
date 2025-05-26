package com.lexigram.app.controller;
import com.lexigram.app.dto.ExperienceDTO;
import com.lexigram.app.dto.ForkExperienceDTO;
import com.lexigram.app.dto.PostCommentDTO;
import com.lexigram.app.service.ExperienceService;
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
public class ExperienceController {

  private final ExperienceService experienceService;

  @Autowired
  public ExperienceController(ExperienceService experienceService) {
    this.experienceService = experienceService;
  }

  @PostMapping("experience/{uuid}/resonate")
  public ResponseEntity<ExperienceDTO> resonateExperience(HttpSession session,
                                                          @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.resonateExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("experience/{uuid}/un-resonate")
  public ResponseEntity<ExperienceDTO> unResonateExperience(HttpSession session,
                                                            @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.unResonateExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @PostMapping("experience/{uuid}/comment")
  public ResponseEntity<ExperienceDTO> commentExperience(HttpSession session,
                                                         @PathVariable UUID uuid,
                                                         @RequestBody PostCommentDTO comment) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.commentExperience(id, uuid, comment);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @DeleteMapping("experience/{expUuid}/comment/{comUuid}")
  public ResponseEntity<ExperienceDTO> deleteExperienceComment(HttpSession session,
                                                               @PathVariable UUID expUuid,
                                                               @PathVariable UUID comUuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.deleteExperienceCommentByUuid(id, expUuid, comUuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @PostMapping("experience/{uuid}/save")
  public ResponseEntity<ExperienceDTO> saveExperience(HttpSession session,
                                                      @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.saveExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("experience/{uuid}/un-save")
  public ResponseEntity<ExperienceDTO> unSaveExperience(HttpSession session,
                                                        @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.unSaveExperience(id, uuid);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @PostMapping(value = "experience/{uuid}/fork", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ExperienceDTO> forkExperience(HttpSession session,
                                                      @PathVariable UUID uuid,
                                                      @RequestBody ForkExperienceDTO fork,
                                                      @RequestPart(value = "file", required = true) MultipartFile file) throws IOException {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ExperienceDTO> optionalExperienceDTO = experienceService.forkExperience(id, uuid, fork, file);

    if (optionalExperienceDTO.isPresent()) {
      ExperienceDTO experienceDTO = optionalExperienceDTO.get();
      return ResponseEntity.ok(experienceDTO);
    }

    return ResponseEntity.status(401).build();

  }

  @GetMapping("experience/{uuid}/share")
  public ResponseEntity<String> getExperienceLink(HttpSession session,
                                                  @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    String postLink = experienceService.getExperienceLink(uuid);

    return ResponseEntity.ok(postLink);

  }

  @GetMapping("experience/{uuid}/branches")
  public ResponseEntity<Set<ExperienceDTO>> getExperienceBranches(HttpSession session,
                                                  @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Set<ExperienceDTO> forks = experienceService.getAllBranches(id, uuid);

    return ResponseEntity.ok(forks);

  }

}