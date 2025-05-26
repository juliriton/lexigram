package com.lexigram.app.controller;

import com.lexigram.app.dto.ConnectionDTO;
import com.lexigram.app.dto.ConnectionProfileDTO;
import com.lexigram.app.service.RelationshipProfileService;
import com.lexigram.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me")
public class RelationshipController {

  private final UserService userService;
  private final RelationshipProfileService relationshipProfileService;

  @Autowired
  public RelationshipController(UserService userService, RelationshipProfileService relationshipProfileService) {
    this.userService = userService;
    this.relationshipProfileService = relationshipProfileService;
  }

  @PostMapping("/users/{uuid}/follow")
  public ResponseEntity<ConnectionDTO> follow(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    Optional<ConnectionDTO> optionalConnection = userService.followUser(id, uuid);

    if (optionalConnection.isPresent()) {
      ConnectionDTO connection = optionalConnection.get();
      return ResponseEntity.ok(connection);
    }
    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("/users/{uuid}/unfollow")
  public ResponseEntity<ConnectionDTO> unfollow(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    Optional<ConnectionDTO> optionalConnection = userService.unfollowUser(id, uuid);
    if (optionalConnection.isPresent()) {
      ConnectionDTO connectionDTO = optionalConnection.get();
      return ResponseEntity.ok(connectionDTO);
    }
    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("/users/profile/followers/{uuid}/remove")
  public ResponseEntity<ConnectionDTO> removeFollower(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    Optional<ConnectionDTO> optionalConnection = userService.removeFollower(id, uuid);

    if (optionalConnection.isPresent()) {
      ConnectionDTO connection = optionalConnection.get();
      return ResponseEntity.ok(connection);
    }
    return ResponseEntity.status(401).build();
  }

  @GetMapping("/users/{username}")
  public ResponseEntity<ConnectionProfileDTO> getRelationshipProfileByUsername(HttpSession session, @PathVariable String username) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ConnectionProfileDTO> optionalConnection = relationshipProfileService.getRelationshipProfileByUsername(id, username);

    if (optionalConnection.isPresent()) {
      ConnectionProfileDTO connection = optionalConnection.get();
      return ResponseEntity.ok(connection);
    }

    return ResponseEntity.status(401).build();
  }

  @GetMapping("/users/{uuid}")
  public ResponseEntity<ConnectionProfileDTO> getRelationshipProfileByUuid(HttpSession session, @PathVariable UUID uuid) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<ConnectionProfileDTO> optionalConnection = relationshipProfileService.getRelationshipProfileByUuid(id, uuid);

    if (optionalConnection.isPresent()) {
      ConnectionProfileDTO connection = optionalConnection.get();
      return ResponseEntity.ok(connection);
    }

    return ResponseEntity.status(401).build();
  }

}
