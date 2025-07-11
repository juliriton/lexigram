package com.lexigram.app.controller;

import com.lexigram.app.dto.PostsDTO;
import com.lexigram.app.dto.SearchDTO;
import com.lexigram.app.service.FeedService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/")
public class FeedController {

  private final FeedService feedService;

  @Autowired
  public FeedController(FeedService feedService) {
    this.feedService = feedService;
  }

  @GetMapping("/feed")
  public ResponseEntity<PostsDTO> getGuestFeed() {
    return ResponseEntity.ok(feedService.getAllPublicPosts());
  }

  @GetMapping("/me/feed")
  public ResponseEntity<PostsDTO> getUserFeedFeed(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<PostsDTO> posts = feedService.getAllPostsExcludingUserWithUserTags(id);

    if (posts.isPresent()) {
      return ResponseEntity.ok(posts.get());
    }
    return ResponseEntity.status(401).build();
  }

  @GetMapping("/me/feed/following")
  public ResponseEntity<PostsDTO> getUserFollowingFeed(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(feedService.getAllFollowingPosts(id));
  }

  @GetMapping("/me/feed/search/{object}")
  public ResponseEntity<SearchDTO> getFeedSearchObject(
      HttpSession session,
      @PathVariable String object,
      @RequestParam(required = false, defaultValue = "true") boolean users,
      @RequestParam(required = false, defaultValue = "true") boolean experiences,
      @RequestParam(required = false, defaultValue = "true") boolean suggestions,
      @RequestParam(required = false, defaultValue = "true") boolean tags,
      @RequestParam(required = false, defaultValue = "false") boolean exact) {

    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(feedService.getSearchObject(object, id, users, experiences, suggestions, tags, exact));
  }

  @GetMapping("/me/feed/discover")
  public ResponseEntity<PostsDTO> getUserDiscoverFeed(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    return ResponseEntity.ok(feedService.getAllDiscoverPosts(id));
  }
}