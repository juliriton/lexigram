package com.lexigram.app.controller;

import com.lexigram.app.dto.UserPostsDTO;
import com.lexigram.app.service.FeedService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/")
public class FeedController {

  private final FeedService feedService;

  @Autowired
  public FeedController(FeedService feedService) {
    this.feedService = feedService;
  }

  @GetMapping("/feed")
  public ResponseEntity<UserPostsDTO> getGuestFeed(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(feedService.getAllPosts(id));
  }

  @GetMapping("/me/feed")
  public ResponseEntity<UserPostsDTO> getUserFeedFeed(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(feedService.getAllPosts(id));
  }

  @GetMapping("/me/feed/following")
  public ResponseEntity<UserPostsDTO> getUserFollowingFeed(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(feedService.getAllPosts(id));
  }

  @GetMapping("/me/feed/discover")
  public ResponseEntity<UserPostsDTO> getUserDiscoverFeed(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(feedService.getAllPosts(id));
  }

}
