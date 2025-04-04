package com.lexigram.app.service;

import com.lexigram.app.dto.UserProfileDTO;
import com.lexigram.app.dto.UserUpdateProfileDTO;
import com.lexigram.app.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileService {

  private final UserProfileRepository userProfileRepository;

  @Autowired
  public UserProfileService(UserProfileRepository userProfileRepository) {
    this.userProfileRepository = userProfileRepository;
  }

  // 📌 Obtener el perfil
  public Optional<UserProfileDTO> getUserProfile(Long id) {
    return userProfileRepository.findById(id)
        .map(userProfile -> new UserProfileDTO(userProfile.getBiography(),
            userProfile.getProfilePictureUrl()));
  }

  // 📌 Actualizar completamente el perfil con `PUT`
  public boolean updateUserProfile(Long id, UserUpdateProfileDTO updateDTO) {
    return userProfileRepository.findById(id)
        .map(userProfile -> {
          if (updateDTO.getBiography() != null) {
            userProfile.setBiography(updateDTO.getBiography());
          }
          if (updateDTO.getProfilePictureUrl() != null) {
            userProfile.setProfilePictureUrl(updateDTO.getProfilePictureUrl());
          }
          userProfileRepository.save(userProfile);
          return true;
        })
        .orElse(false);
  }

  // Chequear esto:

  // 📌 Actualizar solo la foto con `POST`
  //public boolean updateProfilePicture(Long id, String file) {
  //  String uploadedUrl = uploadFileToStorage(file);
  //
  //  return userProfileRepository.findById(id)
  //      .map(userProfile -> {
  //        userProfile.setProfilePictureUrl(uploadedUrl);
  //        userProfileRepository.save(userProfile);
  //        return true;
  //      })
  //      .orElse(false);
  //}

  //private String uploadFileToStorage(String file) {
  //  return "https://example.com/uploads/" + file.getOriginalFilename();
  //}

}

