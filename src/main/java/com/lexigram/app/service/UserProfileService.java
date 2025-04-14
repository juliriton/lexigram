package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.model.Experience;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.User;
import com.lexigram.app.model.UserProfile;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.*;

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
    if (userOptional.isPresent()) {
      Optional<UserProfile> profileOptional = userProfileRepository.findById(id);
      UserProfile profile = profileOptional.get();

      String biography = profile.getBiography();
      String profilePicture = profile.getProfilePictureUrl();
      UserProfileDTO userProfileDTO = new UserProfileDTO(biography, profilePicture);

      return Optional.of(userProfileDTO);
    }
    return Optional.empty();
  }

  public Optional<UserProfileDTO> updateUserProfileBio(Long id, UserUpdateProfileBioDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    Optional<UserProfile> profileOptional = userProfileRepository.findById(id);

    if (userOptional.isPresent()) {
      UserProfile userProfile = profileOptional.get();

      String newBiography = dto.getBiography();

      userProfile.setBiography(newBiography);
      userProfileRepository.save(userProfile);
      return Optional.of(new UserProfileDTO(userProfile.getBiography(),
          userProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

  public Optional<UserProfileDTO> updateProfilePicture(Long id, String imageUrl) {
    Optional<User> userOptional = userRepository.findById(id);
    Optional<UserProfile> userProfileOptional = userProfileRepository.findById(id);

    if (userOptional.isPresent()) {
      String profilePictureUrl = imageUrl;
      UserProfile userProfile = userProfileOptional.get();

      userProfile.setProfilePictureUrl(profilePictureUrl);

      userProfileRepository.save(userProfile);

      return Optional.of(new UserProfileDTO(userProfile.getBiography(),
          userProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

  public UserPostsDTO getAllUserPosts(Long id) {
    Set<Experience> experiences = userProfileRepository.getExperiencesByUserId(id);
    Set<Suggestion> suggestions = userProfileRepository.getSuggestionsByUserId(id);

    UserPostsDTO dto = new UserPostsDTO(experiences, suggestions);
    return dto;
  }

  public Set<ExperienceDTO> getAllUserExperiences(Long id) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()){
      return Collections.emptySet();
    }

    Set<Experience> experiences = userProfileRepository.getExperiencesByUserId(id);

    if (experiences.isEmpty()) return Collections.emptySet();

    Set<Experience> experienceSet = userProfileRepository.getExperiencesByUserId(id);
    Set<ExperienceDTO> experienceDTOset = new HashSet<>();

    for (Experience e : experienceSet){
      experienceDTOset.add(new ExperienceDTO(e));
    }

    return experienceDTOset;
  }

  public Set<SuggestionDTO> getAllUserSuggestions(Long id){
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()){
      return Collections.emptySet();
    }

    Set<Suggestion> suggestions = userProfileRepository.getSuggestionsByUserId(id);
    Set<SuggestionDTO> suggestionDTOset = new HashSet<>();

    for (Suggestion s : suggestions){
      suggestionDTOset.add(new SuggestionDTO(s));
    }

    return suggestionDTOset;
  }

}

