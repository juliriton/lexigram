package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.service.RelationshipProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

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

    Optional<ConnectionProfileDTO> profile = relationshipProfileService.getRelationshipProfileByUuid(id, uuid);
    if (profile.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(profile.get());
  }

  @GetMapping("/posts")
  public ResponseEntity<UserPostsDTO> getAllPosts(@PathVariable UUID uuid, HttpSession session) {
    Long viewerId = (Long) session.getAttribute("user");
    if (viewerId == null) return ResponseEntity.status(401).build();

    try {
      UserPostsDTO posts = relationshipProfileService.getAllRelationshipPosts(viewerId, uuid);
      return ResponseEntity.ok(posts);
    } catch (UserNotFoundException e) {
      return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/posts/experiences")
  public ResponseEntity<Set<ExperienceDTO>> getAllExperiences(@PathVariable UUID uuid, HttpSession session) {
    Long viewerId = (Long) session.getAttribute("user");
    if (viewerId == null) return ResponseEntity.status(401).build();

    try {
      Set<ExperienceDTO> experiences = relationshipProfileService.getAllRelationshipExperiences(viewerId, uuid);
      return ResponseEntity.ok(experiences);
    } catch (UserNotFoundException e) {
      return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/posts/suggestions")
  public ResponseEntity<Set<SuggestionDTO>> getAllSuggestions(@PathVariable UUID uuid, HttpSession session) {
    Long viewerId = (Long) session.getAttribute("user");
    if (viewerId == null) return ResponseEntity.status(401).build();

    try {
      Set<SuggestionDTO> suggestions = relationshipProfileService.getAllRelationshipSuggestions(viewerId, uuid);
      return ResponseEntity.ok(suggestions);
    } catch (UserNotFoundException e) {
      return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/followers")
  public ResponseEntity<Set<ConnectionDTO>> getFollowers(@PathVariable UUID uuid, HttpSession session) {
    Long viewerId = (Long) session.getAttribute("user");
    if (viewerId == null) return ResponseEntity.status(401).build();

    try {
      Set<ConnectionDTO> followers = relationshipProfileService.getRelationshipFollowers(viewerId, uuid);
      return ResponseEntity.ok(followers);
    } catch (UserNotFoundException e) {
      return ResponseEntity.notFound().build();
    }
  }

  @GetMapping("/following")
  public ResponseEntity<Set<ConnectionDTO>> getFollowing(@PathVariable UUID uuid, HttpSession session) {
    Long viewerId = (Long) session.getAttribute("user");
    if (viewerId == null) return ResponseEntity.status(401).build();

    try {
      Set<ConnectionDTO> following = relationshipProfileService.getRelationshipFollowing(viewerId, uuid);
      return ResponseEntity.ok(following);
    } catch (UserNotFoundException e) {
      return ResponseEntity.notFound().build();
    }
  }

}
