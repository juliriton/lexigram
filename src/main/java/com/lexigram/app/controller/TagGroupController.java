package com.lexigram.app.controller;

import com.lexigram.app.dto.PostsDTO;
import com.lexigram.app.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/tags")
public class TagGroupController {

  private final TagService tagService;

  @Autowired
  public TagGroupController(TagService tagService) {
    this.tagService = tagService;
  }

  @GetMapping
  public ResponseEntity<PostsDTO> getAllTagGroups() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @GetMapping
  public ResponseEntity<PostsDTO> getAllUserTagGroups() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @GetMapping
  public ResponseEntity<PostsDTO> getRecentUserTagGroups() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @GetMapping
  public ResponseEntity<PostsDTO> getTagGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @GetMapping
  public ResponseEntity<PostsDTO> getTrendingTagGroups() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @PostMapping
  public ResponseEntity<PostsDTO> createTagGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @DeleteMapping
  public ResponseEntity<PostsDTO> deleteTagGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

}
