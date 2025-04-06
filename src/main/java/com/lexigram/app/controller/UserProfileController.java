package com.lexigram.app.controller;

import com.lexigram.app.dto.UserProfileDTO;
import com.lexigram.app.dto.UserUpdateProfileBioDTO;
import com.lexigram.app.service.UserProfileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users/{id}/profile")
public class UserProfileController {

  @Value("${lexigram.upload.dir}")
  private String uploadDir;

  private final UserProfileService userProfileService;

  @Autowired
  public UserProfileController(UserProfileService userProfileService) {
    this.userProfileService = userProfileService;
  }

  @GetMapping
  public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
    Optional<UserProfileDTO> profile = userProfileService.getProfile(id);
    if (profile.isPresent()) {
      return ResponseEntity.ok(profile.get());
    }
    return ResponseEntity.notFound().build();
  }

  @PutMapping("/edit/biography")
  public ResponseEntity<String> updateProfileBiography(
      @PathVariable Long id,
      @RequestBody UserUpdateProfileBioDTO dto) {
    Optional<UserProfileDTO> profile = userProfileService.getProfile(id);
    if (profile.isPresent()) {
      Optional<UserProfileDTO> updatedProfile = userProfileService.updateUserProfileBio(id, dto);
      return ResponseEntity.ok(updatedProfile.get().getBiography());
    }
    return ResponseEntity.notFound().build();
  }

  @PostMapping("/edit/profile-picture")
  public ResponseEntity<String> updateProfilePicture(@PathVariable Long id,
                                                     @RequestParam MultipartFile file) {
    try {
      String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
      File destinationFile = new File(uploadDir + File.separator + fileName);

      destinationFile.getParentFile().mkdirs(); // crea carpetas si no existen
      file.transferTo(destinationFile); // guarda el archivo

      // Guarda el path en la base de datos como ruta relativa
      String relativePath = "/images/" + fileName;
      userProfileService.updateProfilePicture(id, relativePath);

      return ResponseEntity.ok("Imagen subida y guardada correctamente");
    } catch (IOException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error al guardar la imagen: " + e.getMessage());
    }
  }

}
