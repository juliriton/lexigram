package com.lexigram.app.service;

import com.lexigram.app.dto.UserProfileDTO;
import com.lexigram.app.dto.UserUpdateProfileBioDTO;
import com.lexigram.app.model.UserProfile;
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

  public Optional<UserProfileDTO> getProfile(Long id) {
    Optional<UserProfile> userProfile = userProfileRepository.findById(id);
    if (userProfile.isPresent()) {
      UserProfile profile = userProfile.get();
      String biography = profile.getBiography();
      String profilePicture = profile.getProfilePictureUrl();
      UserProfileDTO userProfileDTO = new UserProfileDTO(biography, profilePicture);

      return Optional.of(userProfileDTO);
    }
    return Optional.empty();
  }

  public Optional<UserProfileDTO> updateUserProfileBio(Long id, UserUpdateProfileBioDTO dto) {
    Optional<UserProfile> userProfileOptional = userProfileRepository.findById(id);

    if (userProfileOptional.isPresent()) {
      String biography = dto.getBiography();
      UserProfile userProfile = userProfileOptional.get();

      userProfile.setBiography(biography);

      userProfileRepository.save(userProfile);
      return Optional.of(new UserProfileDTO(userProfile.getBiography(),
          userProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

  public Optional<UserProfileDTO> updateProfilePicture(Long id, String imageUrl) {
    Optional<UserProfile> userProfileOptional = userProfileRepository.findById(id);

    if (userProfileOptional.isPresent()) {
      String profilePictureUrl = imageUrl;
      UserProfile userProfile = userProfileOptional.get();

      userProfile.setProfilePictureUrl(profilePictureUrl);

      userProfileRepository.save(userProfile);

      return Optional.of(new UserProfileDTO(userProfile.getBiography(),
          userProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

}

