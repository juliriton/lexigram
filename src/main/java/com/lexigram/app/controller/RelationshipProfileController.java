package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.service.UserProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/{id}/profile")
public class RelationshipProfileController {

  private final UserProfileService userProfileService;

  @Autowired
  public RelationshipProfileController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @GetMapping
  public ResponseEntity<UserProfileDTO> getRelationshipProfile(@PathVariable Long relationshipId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserProfileDTO> profile = userProfileService.getProfile(relationshipId);
    if (profile.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(profile.get());
  }


  @GetMapping("/posts")
  public ResponseEntity<UserPostsDTO> getAllPosts(@PathVariable Long relationshipId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(userProfileService.getAllUserPosts(relationshipId));
  }

  @GetMapping("/posts/experiences")
  public ResponseEntity<Set<ExperienceDTO>> getAllExperiences(@PathVariable Long relationshipId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(userProfileService.getAllUserExperiences(relationshipId));
  }

  @GetMapping("/posts/suggestions")
  public ResponseEntity<Set<SuggestionDTO>> getAllSuggestions(@PathVariable Long relationshipId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(userProfileService.getAllUserSuggestions(relationshipId));
  }

  @GetMapping("/followers")
  public ResponseEntity<Set<ConnectionDTO>> getFollowers(@PathVariable Long relationshipId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(userProfileService.getFollowers(relationshipId));
  }

  @GetMapping("/following")
  public ResponseEntity<Set<ConnectionDTO>> getFollowing(@PathVariable Long relationshipId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(userProfileService.getFollowing(relationshipId));
  }

}
