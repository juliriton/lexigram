package com.lexigram.app.controller;

import com.lexigram.app.dto.UserProfileDTO;
import com.lexigram.app.dto.UserUpdateProfileBioDTO;
import com.lexigram.app.service.UserProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/me/profile")
public class UserProfileController {

  @Value("${lexigram.upload.dir}")
  private String uploadDir;

  private final UserProfileService userProfileService;

  @Autowired
  public UserProfileController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @GetMapping
  public ResponseEntity<UserProfileDTO> getProfile(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserProfileDTO> profile = userProfileService.getProfile(id);
    if (profile.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(profile.get());
  }

  @PutMapping("/edit/biography")
  public ResponseEntity<String> updateBiography(HttpSession session,
                                                @RequestBody UserUpdateProfileBioDTO dto) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserProfileDTO> updated = userProfileService.updateUserProfileBio(id, dto);
    if (updated.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(updated.get().getBiography());
  }

  @PostMapping("/edit/profile-picture")
  public ResponseEntity<String> updateProfilePicture(HttpSession session,
                                                     @RequestParam MultipartFile file) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    try {
      String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
      File destination = new File(uploadDir + File.separator + fileName);
      destination.getParentFile().mkdirs();
      file.transferTo(destination);

      String relativePath = "/images/" + fileName;
      userProfileService.updateProfilePicture(id, relativePath);

      return ResponseEntity.ok("Imagen subida correctamente.");
    } catch (IOException e) {
      return ResponseEntity.status(500).body("Error al subir imagen: " + e.getMessage());
    }
  }
}
