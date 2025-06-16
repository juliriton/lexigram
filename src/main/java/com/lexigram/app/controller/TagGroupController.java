package com.lexigram.app.controller;

import com.lexigram.app.dto.PostsDTO;
import com.lexigram.app.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/tags/groups")
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

  @GetMapping("/created")
  public ResponseEntity<PostsDTO> getAllUserTagGroups() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @GetMapping("/recent")
  public ResponseEntity<PostsDTO> getRecentUserTagGroups() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @GetMapping("{groupId}")
  public ResponseEntity<PostsDTO> getTagGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @GetMapping("/trending")
  public ResponseEntity<PostsDTO> getTrendingTagGroups() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @PostMapping("/create")
  public ResponseEntity<PostsDTO> createTagGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  @DeleteMapping("/created/delete/{groupId}")
  public ResponseEntity<PostsDTO> deleteTagGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

}
