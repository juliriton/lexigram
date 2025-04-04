package com.lexigram.app.controller;

import com.lexigram.app.dto.UserProfileDTO;
import com.lexigram.app.dto.UserUpdateProfileDTO;
import com.lexigram.app.service.UserProfileService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/user")

public class UserProfileController {
  private final UserProfileService userProfileService;

  @Autowired
  public UserProfileController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Long id) {
    Optional<UserProfileDTO> userProfile = userProfileService.getUserProfile(id);
    return userProfile.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserUpdateProfileDTO> updateUserProfile(@PathVariable Long id, @RequestBody  UserUpdateProfileDTO updateDTO) {
    boolean updated = userProfileService.updateUserProfile(id, updateDTO);
    return updated ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  }

  //@PostMapping("/{id}/profile-picture")
  //public ResponseEntity<Void> updateProfilePicture(@PathVariable Long id, @RequestParam("file") String file) {
  //  boolean updated = userProfileService.updateProfilePicture(id, file);
  //  return updated ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
  //}

}
