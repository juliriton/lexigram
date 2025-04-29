package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.service.RelationshipProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/users/{uuid}/profile")
public class RelationshipProfileController {

  private final RelationshipProfileService relationshipProfileService;
  @Autowired
  public RelationshipProfileController(RelationshipProfileService relationshipProfileService) {
    this.relationshipProfileService = relationshipProfileService;
  }

  @GetMapping
  public ResponseEntity<ConnectionProfileDTO> getRelationshipProfile(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ConnectionProfileDTO> profile = relationshipProfileService.getRelationshipProfile(id, uuid);
    if (profile.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(profile.get());
  }

  @GetMapping("/posts")
  public ResponseEntity<UserPostsDTO> getAllPosts(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(relationshipProfileService.getAllRelationshipPosts(uuid));
  }

  @GetMapping("/posts/experiences")
  public ResponseEntity<Set<ExperienceDTO>> getAllExperiences(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(relationshipProfileService.getAllRelationshipExperiences(uuid));
  }

  @GetMapping("/posts/suggestions")
  public ResponseEntity<Set<SuggestionDTO>> getAllSuggestions(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(relationshipProfileService.getAllRelationshipSuggestions(uuid));
  }

  @GetMapping("/followers")
  public ResponseEntity<Set<ConnectionDTO>> getFollowers(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(relationshipProfileService.getRelationshipFollowers(uuid));
  }

  @GetMapping("/following")
  public ResponseEntity<Set<ConnectionDTO>> getFollowing(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(relationshipProfileService.getRelationshipFollowing(uuid));
  }

}
