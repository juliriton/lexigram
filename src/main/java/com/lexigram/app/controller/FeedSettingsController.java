package com.lexigram.app.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/")
public class FeedSettingsController {

  @GetMapping("/feed")
  public String getGuestFeed() {
    return "Hello World";
  }

  @GetMapping("/me/feed")
  public String getUserFeedFeed() {
    return "Hello World";
  }

  @GetMapping("/me/feed/following")
  public String getUserFollowingFeed() {
    return "Hello World";
  }

  @GetMapping("/me/feed/discover")
  public String getUserDisocverFeed() {
    return "Hello World";
  }

}
