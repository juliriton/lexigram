package com.lexigram.app.controller;

import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me")
public class RelationshipController {

  private final UserService userService;

  @Autowired
  public RelationshipController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/{id}/follow")
  public ResponseEntity<UserDTO> follow(@PathVariable Long toFollowId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserDTO> optionalUser = userService.followUser(id, toFollowId);

    if (optionalUser.isPresent()) {
      UserDTO user = optionalUser.get();
      return ResponseEntity.ok(user);
    }
    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("/{id}/unfollow")
  public ResponseEntity<UserDTO> unfollow(@PathVariable Long userId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserDTO> optionalUser = userService.unfollowUser(id, userId);
    if (optionalUser.isPresent()) {
      UserDTO user = optionalUser.get();
      return ResponseEntity.ok(user);
    }
    return ResponseEntity.status(401).build();
  }

  @DeleteMapping("/{id}/remove")
  public ResponseEntity<UserDTO> removeFollower(@PathVariable Long userId, HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserDTO> optionalUser = userService.removeFollower(id, userId);

    if (optionalUser.isPresent()) {
      UserDTO user = optionalUser.get();
      return ResponseEntity.ok(user);
    }
    return ResponseEntity.status(401).build();
  }
}
