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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RelationshipProfileService {

  private final UserRepository userRepository;
  private final UserProfileRepository userProfileRepository;
  private final ExperienceRepository experienceRepository;
  private final SuggestionRepository suggestionRepository;

  @Autowired
  public RelationshipProfileService(UserRepository userRepository,
                            UserProfileRepository userProfileRepository,
                            ExperienceRepository experienceRepository,
                            SuggestionRepository suggestionRepository) {
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
    this.experienceRepository = experienceRepository;
    this.suggestionRepository = suggestionRepository;
  }


  public Optional<ConnectionProfileDTO> getRelationshipProfileByUuid(Long id, UUID uuid) {
    User user = userRepository.findById(id).get();
    Optional<User> targetUserOptional = userRepository.findByUuid(uuid);

    if (targetUserOptional.isPresent()) {
      User targetUser = targetUserOptional.get();

      Optional<UserProfile> targetProfileOptional = userProfileRepository.findByUserUuid(uuid);
      UserProfile targetProfile = targetProfileOptional.get();

      String username = targetUser.getUsername();
      String biography = targetProfile.getBiography();
      String profilePicture = targetProfile.getProfilePictureUrl();
      boolean isFollowing = targetUser.getFollowers().contains(user);
      Long targetFollowingAmount = targetUser.getFollowingAmount();
      Long targetFollowerAmount = targetUser.getFollowerAmount();

      ConnectionProfileDTO connectionProfileDTO = new ConnectionProfileDTO(
          username,
          biography,
          profilePicture,
          isFollowing,
          targetFollowingAmount,
          targetFollowerAmount);
      return Optional.of(connectionProfileDTO);
    }
    return Optional.empty();
  }

  public Optional<ConnectionProfileDTO> getRelationshipProfileByUsername(Long id, String username) {
    String trimmedUsername = username.trim();
    User user = userRepository.findById(id).get();
    Optional<User> targetUserOptional = userRepository.findByUsername(trimmedUsername);

    if (targetUserOptional.isPresent()) {
      User targetUser = targetUserOptional.get();

      Optional<UserProfile> targetProfileOptional = userProfileRepository.findByUserUuid(targetUser.getUuid());
      UserProfile targetProfile = targetProfileOptional.get();

      String targetUsername = targetUser.getUsername();
      String targetBiography = targetProfile.getBiography();
      String targetProfilePicture = targetProfile.getProfilePictureUrl();
      boolean isFollowing = targetUser.getFollowers().contains(user);
      Long targetFollowingAmount = targetUser.getFollowingAmount();
      Long targetFollowerAmount = targetUser.getFollowerAmount();

      ConnectionProfileDTO connectionProfileDTO = new ConnectionProfileDTO(
          targetUsername,
          targetBiography,
          targetProfilePicture,
          isFollowing,
          targetFollowingAmount,
          targetFollowerAmount);
      return Optional.of(connectionProfileDTO);
    }
    return Optional.empty();
  }

  public UserPostsDTO getAllRelationshipPosts(UUID uuid) {
    User user = userRepository.findByUuid(uuid).get();

    Set<Experience> experiences = experienceRepository.getExperiencesByUserUuid(uuid);

    Set<ExperienceDTO> experienceDTOs = new HashSet<>();
    for (Experience experience : experiences) {
      experienceDTOs.add(new ExperienceDTO(experience));
    }

    Set<Suggestion> suggestions = suggestionRepository.getSuggestionsByUserUuid(uuid);

    Set<SuggestionDTO> suggestionDTOs = new HashSet<>();

    for (Suggestion suggestion : suggestions) {
      suggestionDTOs.add(new SuggestionDTO(suggestion));
    }

    UserDTO userDTO = new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail());
    UserPostsDTO dto = new UserPostsDTO(userDTO, experienceDTOs, suggestionDTOs);
    return dto;
  }

  public Set<ExperienceDTO> getAllRelationshipExperiences(UUID uuid) {
    Optional<User> userOptional = userRepository.findByUuid(uuid);

    if (userOptional.isEmpty()){
      throw new UserNotFoundException();
    }

    Set<Experience> experiences = experienceRepository.getExperiencesByUserUuid(uuid);

    if (experiences.isEmpty()) return Collections.emptySet();

    Set<ExperienceDTO> experiencesDTOset = new HashSet<>();

    for (Experience e : experiences){
      experiencesDTOset.add(new ExperienceDTO(e));
    }

    return experiencesDTOset;
  }

  public Set<SuggestionDTO> getAllRelationshipSuggestions(UUID uuid){
    Optional<User> userOptional = userRepository.findByUuid(uuid);

    if (userOptional.isEmpty()){
      throw new UserNotFoundException();
    }

    Set<Suggestion> suggestions = suggestionRepository.getSuggestionsByUserUuid(uuid);

    if (suggestions.isEmpty()) return Collections.emptySet();

    Set<SuggestionDTO> suggestionDTOset = new HashSet<>();

    for (Suggestion s : suggestions){
      suggestionDTOset.add(new SuggestionDTO(s));
    }

    return suggestionDTOset;
  }

  public Set<ConnectionDTO> getRelationshipFollowers(UUID uuid) {
    Optional<User> userOptional = userRepository.findByUuid(uuid);
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

  public Set<ConnectionDTO> getRelationshipFollowing(UUID uuid){
    Optional<User> userOptional = userRepository.findByUuid(uuid);
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
}
