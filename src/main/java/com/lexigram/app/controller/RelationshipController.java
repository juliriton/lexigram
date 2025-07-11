package com.lexigram.app.controller;

import com.lexigram.app.dto.ConnectionDTO;
import com.lexigram.app.dto.ConnectionProfileDTO;
import com.lexigram.app.model.FollowRequest;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserPrivacySettings;
import com.lexigram.app.repository.FollowRequestRepository;
import com.lexigram.app.repository.NotificationRepository;
import com.lexigram.app.repository.UserPrivacySettingsRepository;
import com.lexigram.app.repository.UserRepository;
import com.lexigram.app.service.FollowRequestService;
import com.lexigram.app.service.RelationshipProfileService;
import com.lexigram.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me")
public class RelationshipController {

  private final UserService userService;
  private final RelationshipProfileService relationshipProfileService;
  private final UserRepository userRepository;
  private final UserPrivacySettingsRepository userPrivacySettingsRepository;
  private final FollowRequestService followRequestService;
  private final FollowRequestRepository followRequestRepository;
  private final NotificationRepository notificationRepository;


  @Autowired
  public RelationshipController(UserService userService,
                                RelationshipProfileService relationshipProfileService,
                                UserRepository userRepository,
                                UserPrivacySettingsRepository userPrivacySettingsRepository,
                                FollowRequestService followRequestService,
                                FollowRequestRepository followRequestRepository, NotificationRepository notificationRepository) {
    this.userService = userService;
    this.relationshipProfileService = relationshipProfileService;
    this.userRepository = userRepository;
    this.userPrivacySettingsRepository = userPrivacySettingsRepository;
    this.followRequestService = followRequestService;
    this.followRequestRepository = followRequestRepository;
    this.notificationRepository = notificationRepository;
  }

  @PostMapping("/users/{uuid}/follow")
  public ResponseEntity<Map<String, Object>> follow(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<User> targetUser = userRepository.findByUuid(uuid);
    if (targetUser.isEmpty()) return ResponseEntity.status(404).build();

    boolean existingRequest = followRequestRepository.existsByRequesterIdAndRequestedId(id, targetUser.get().getId());
    if (existingRequest) {
      Map<String, Object> response = new HashMap<>();
      response.put("requestPending", true);
      response.put("message", "Follow request already sent");
      return ResponseEntity.ok(response);
    }

    Optional<UserPrivacySettings> privacySettings = userPrivacySettingsRepository.findByUser(targetUser.get());
    boolean isPrivate = privacySettings.isPresent() && !privacySettings.get().getVisibility();

    if (isPrivate) {

      boolean success = followRequestService.sendFollowRequest(id, targetUser.get().getId());
      if (success) {
        Map<String, Object> response = new HashMap<>();
        response.put("requestPending", true);
        response.put("message", "Follow request sent");
        return ResponseEntity.ok(response);
      }
      return ResponseEntity.status(400).build();
    } else {

      Optional<ConnectionDTO> optionalConnection = userService.followUser(id, uuid);
      if (optionalConnection.isPresent()) {
        Map<String, Object> response = new HashMap<>();
        response.put("requestPending", false);
        response.put("following", true);
        response.put("connection", optionalConnection.get());
        return ResponseEntity.ok(response);
      }
      return ResponseEntity.status(401).build();
    }
  }

  @PostMapping("/follow-requests/{uuid}/accept")
  public ResponseEntity<Void> acceptFollowRequest(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<FollowRequest> followRequest = followRequestRepository.findByUuid(uuid);
    if (followRequest.isEmpty()) {
      return ResponseEntity.status(404).build();
    }

    if (!followRequest.get().getRequested().getId().equals(id)) {
      return ResponseEntity.status(403).build();
    }

    boolean success = followRequestService.acceptFollowRequest(uuid);
    return success ? ResponseEntity.ok().build() : ResponseEntity.status(400).build();
  }

  @PostMapping("/follow-requests/{uuid}/reject")
  public ResponseEntity<Void> rejectFollowRequest(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<FollowRequest> followRequest = followRequestRepository.findByUuid(uuid);
    if (followRequest.isEmpty()) {
      return ResponseEntity.status(404).build();
    }

    if (!followRequest.get().getRequested().getId().equals(id)) {
      return ResponseEntity.status(403).build();
    }

    boolean success = followRequestService.rejectFollowRequest(uuid);
    return success ? ResponseEntity.ok().build() : ResponseEntity.status(400).build();
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

  @GetMapping("/users/username/{username}")
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

  @DeleteMapping("/users/{uuid}/cancel-follow-request")
  public ResponseEntity<Void> cancelFollowRequest(@PathVariable UUID uuid, HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<User> targetUser = userRepository.findByUuid(uuid);
    if (targetUser.isEmpty()) return ResponseEntity.status(404).build();


    Optional<FollowRequest> followRequest = followRequestRepository.findByRequesterIdAndRequestedId(id, targetUser.get().getId());
    if (followRequest.isPresent()) {

      notificationRepository.deleteByFollowRequest(followRequest.get());

      followRequestRepository.delete(followRequest.get());
      return ResponseEntity.ok().build();
    }

    return ResponseEntity.status(404).build();
  }

}
