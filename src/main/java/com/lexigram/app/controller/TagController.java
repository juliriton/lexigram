package com.lexigram.app.controller;

import com.lexigram.app.dto.TagDTO;
import com.lexigram.app.service.TagService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth/me/tags")
public class TagController {

  private final TagService tagService;

  @Autowired
  public TagController(TagService tagService) {
    this.tagService = tagService;
  }

  @GetMapping("/all")
  public ResponseEntity<List<TagDTO>> getAllTags(HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    Optional<List<TagDTO>> tags = tagService.getAllTags(userId);

    if (tags.isPresent()) {
      return ResponseEntity.ok(tags.get());
    }

    return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
  }

  @GetMapping("/{uuid}")
  public ResponseEntity<TagDTO> getTagByUuid(@PathVariable UUID uuid, HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    return tagService.getTagByUuid(userId, uuid)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("/feed")
  public ResponseEntity<Set<TagDTO>> getFeedTags(HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    return tagService.getAllFeedTags(userId)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/feed/add/{uuid}")
  public ResponseEntity<TagDTO> addTagToFeed(@PathVariable UUID uuid, HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    boolean added = tagService.addTagToFeedByUuid(userId, uuid);
    if (added) {
      // Return the updated tag with inFeed = true
      return tagService.getTagByUuid(userId, uuid)
          .map(ResponseEntity::ok)
          .orElse(ResponseEntity.notFound().build());
    }
    return ResponseEntity.notFound().build();
  }

  @PostMapping("/feed/remove/{uuid}")
  public ResponseEntity<TagDTO> removeTagFromFeed(@PathVariable UUID uuid, HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    boolean removed = tagService.removeTagFromFeedByUuid(userId, uuid);
    if (removed) {
      // Return the updated tag with inFeed = false
      return tagService.getTagByUuid(userId, uuid)
          .map(ResponseEntity::ok)
          .orElse(ResponseEntity.notFound().build());
    }
    return ResponseEntity.notFound().build();
  }

  @PostMapping("/feed/add-all")
  public ResponseEntity<Void> addAllTagsToFeed(HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    boolean success = tagService.addAllTagsToFeed(userId);
    return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }

  @PostMapping("/feed/clear")
  public ResponseEntity<Void> removeAllTagsFromFeed(HttpSession session) {
    Long userId = (Long) session.getAttribute("user");
    if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

    boolean success = tagService.removeAllTagsFromFeed(userId);
    return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }

}