package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.repository.ExperienceRepository;
import com.lexigram.app.repository.SuggestionRepository;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserProfileService {

  private final UserRepository userRepository;
  private final UserProfileRepository userProfileRepository;
  private final ExperienceRepository experienceRepository;
  private final SuggestionRepository suggestionRepository;

  @Autowired
  public UserProfileService(UserRepository userRepository,
                            UserProfileRepository userProfileRepository,
                            ExperienceRepository experienceRepository,
                            SuggestionRepository suggestionRepository) {
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
    this.experienceRepository = experienceRepository;
    this.suggestionRepository = suggestionRepository;
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
    User user = userRepository.findById(id).get();

    Set<Experience> experiences = experienceRepository.getExperiencesByUserId(id);

    Set<ExperienceDTO> experienceDTOs = new HashSet<>();
    for (Experience experience : experiences) {
      experienceDTOs.add(new ExperienceDTO(experience));
    }

    Set<Suggestion> suggestions = suggestionRepository.getSuggestionsByUserId(id);

    Set<SuggestionDTO> suggestionDTOs = new HashSet<>();

    for (Suggestion suggestion : suggestions) {
      suggestionDTOs.add(new SuggestionDTO(suggestion));
    }

    UserDTO userDTO = new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail());
    UserPostsDTO dto = new UserPostsDTO(userDTO, experienceDTOs, suggestionDTOs);
    return dto;
  }

  public Set<ExperienceDTO> getAllUserExperiences(Long id) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()){
      throw new UserNotFoundException();
    }

    Set<Experience> experiences = experienceRepository.getExperiencesByUserId(id);

    if (experiences.isEmpty()) return Collections.emptySet();

    Set<ExperienceDTO> experiencesDTOset = new HashSet<>();

    for (Experience e : experiences){
      experiencesDTOset.add(new ExperienceDTO(e));
    }

    return experiencesDTOset;
  }

  public Set<SuggestionDTO> getAllUserSuggestions(Long id){
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()){
      throw new UserNotFoundException();
    }

    Set<Suggestion> suggestions = suggestionRepository.getSuggestionsByUserId(id);

    if (suggestions.isEmpty()) return Collections.emptySet();

    Set<SuggestionDTO> suggestionDTOset = new HashSet<>();

    for (Suggestion s : suggestions){
      suggestionDTOset.add(new SuggestionDTO(s));
    }

    return suggestionDTOset;
  }

  public Set<ConnectionDTO> getFollowers(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()){
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Set<ConnectionDTO> followers = new HashSet<>();

    for (User u : user.getFollowers()){
      UserProfile userProfile = userProfileRepository.findById(u.getId()).get();
      String profilePicture = userProfile.getProfilePictureUrl();
      followers.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), profilePicture));
    }
    return followers;
  }

  public Set<ConnectionDTO> getFollowing(Long id){
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()){
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Set<ConnectionDTO> following = new HashSet<>();

    for (User u : user.getFollowing()){
      UserProfile userProfile = userProfileRepository.findById(u.getId()).get();
      String profilePicture = userProfile.getProfilePictureUrl();
      following.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), profilePicture));
    }
    return following;
  }

  @Transactional
  public ConnectionDTO removeFollower(Long id, UUID followerUuid) {
    Optional<User> userOptional = userRepository.findById(id);
    Optional<User> followerOptional = userRepository.findByUuid(followerUuid);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    if (followerOptional.isEmpty()) {
      throw new UnsupportedOperationException();
    }

    User user = userOptional.get();
    User follower = followerOptional.get();
    UserProfile followerProfile = userProfileRepository.findById(follower.getId()).get();

    user.removeFollower(follower);
    follower.removeFollowing(user);

    userRepository.save(user);
    userRepository.save(follower);

    return new ConnectionDTO(follower.getUuid(),
        follower.getUsername(),
        follower.getEmail(),
        followerProfile.getProfilePictureUrl());
  }

}

