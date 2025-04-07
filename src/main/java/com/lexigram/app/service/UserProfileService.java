package com.lexigram.app.service;

import com.lexigram.app.dto.UserProfileDTO;
import com.lexigram.app.dto.UserUpdateProfileBioDTO;
import com.lexigram.app.model.User;
import com.lexigram.app.model.UserProfile;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileService {

  private final UserRepository userRepository;
  private final UserProfileRepository userProfileRepository;

  @Autowired
  public UserProfileService(UserRepository userRepository,
                            UserProfileRepository userProfileRepository) {
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
  }

  public Optional<UserProfileDTO> getProfile(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    Optional<UserProfile> profileOptional = userProfileRepository.findById(id);
    if (userOptional.isPresent()) {
      User user = userOptional.get();
      UserProfile profile = profileOptional.get();

      String username = user.getUsername();
      String biography = profile.getBiography();
      String profilePicture = profile.getProfilePictureUrl();
      UserProfileDTO userProfileDTO = new UserProfileDTO(username, biography, profilePicture);

      return Optional.of(userProfileDTO);
    }
    return Optional.empty();
  }

  public Optional<UserProfileDTO> updateUserProfileBio(Long id, UserUpdateProfileBioDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    Optional<UserProfile> profileOptional = userProfileRepository.findById(id);

    if (userOptional.isPresent()) {
      User user = userOptional.get();
      UserProfile userProfile = profileOptional.get();

      String newBiography = dto.getBiography();

      userProfile.setBiography(newBiography);
      userProfileRepository.save(userProfile);
      return Optional.of(new UserProfileDTO(user.getUsername(), userProfile.getBiography(),
          userProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

  public Optional<UserProfileDTO> updateProfilePicture(Long id, String imageUrl) {
    Optional<User> userOptional = userRepository.findById(id);
    Optional<UserProfile> userProfileOptional = userProfileRepository.findById(id);

    if (userOptional.isPresent()) {
      User user = userOptional.get();
      String profilePictureUrl = imageUrl;
      UserProfile userProfile = userProfileOptional.get();

      userProfile.setProfilePictureUrl(profilePictureUrl);

      userProfileRepository.save(userProfile);

      return Optional.of(new UserProfileDTO(user.getUsername(), userProfile.getBiography(),
          userProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

}

