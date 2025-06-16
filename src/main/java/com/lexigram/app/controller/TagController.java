package com.lexigram.app.controller;

import com.lexigram.app.dto.PostsDTO;
import com.lexigram.app.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/tags")
public class TagController {

  private final TagService tagService;

  @Autowired
  public TagController(TagService tagService) {
    this.tagService = tagService;
  }

  public ResponseEntity<PostsDTO> createTag() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  public ResponseEntity<PostsDTO> addTagToFeed() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  public ResponseEntity<PostsDTO> addTagToGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

  public ResponseEntity<PostsDTO> removeTagFromGroup() {
    return ResponseEntity.ok(tagService.addToFeed());
  }

}
