package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.model.user.UserPrivacySettings;
import com.lexigram.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RelationshipProfileService {

  private final UserRepository userRepository;
  private final UserProfileRepository userProfileRepository;
  private final ExperienceRepository experienceRepository;
  private final SuggestionRepository suggestionRepository;
  private final UserPrivacySettingsRepository userPrivacySettingsRepository;
  private final FollowRequestRepository followRequestRepository;

  @Autowired
  public RelationshipProfileService(UserRepository userRepository,
                                    UserProfileRepository userProfileRepository,
                                    ExperienceRepository experienceRepository,
                                    SuggestionRepository suggestionRepository,
                                    UserPrivacySettingsRepository userPrivacySettingsRepository, FollowRequestRepository followRequestRepository) {
    this.userRepository = userRepository;
    this.userProfileRepository = userProfileRepository;
    this.experienceRepository = experienceRepository;
    this.suggestionRepository = suggestionRepository;
    this.userPrivacySettingsRepository = userPrivacySettingsRepository;
    this.followRequestRepository = followRequestRepository;
  }

  private boolean canViewPrivateContent(User viewer, User targetUser) {
    if (viewer.getId().equals(targetUser.getId())) {
      return true;
    }

    Optional<UserPrivacySettings> privacySettings = userPrivacySettingsRepository.findByUser(targetUser);
    if (privacySettings.isPresent() && !privacySettings.get().getVisibility()) {
      return targetUser.getFollowers().contains(viewer);
    }

    return true;
  }

  private boolean isPrivateAccount(User user) {
    Optional<UserPrivacySettings> privacySettings = userPrivacySettingsRepository.findByUser(user);
    return privacySettings.isPresent() && !privacySettings.get().getVisibility();
  }

  public Optional<ConnectionProfileDTO> getRelationshipProfileByUuid(Long viewerId, UUID targetUserUuid) {
    Optional<User> viewerOptional = userRepository.findById(viewerId);
    if (viewerOptional.isEmpty()) return Optional.empty();

    User viewer = viewerOptional.get();
    Optional<User> targetUserOptional = userRepository.findByUuid(targetUserUuid);
    if (targetUserOptional.isEmpty()) return Optional.empty();

    User targetUser = targetUserOptional.get();

    Optional<UserProfile> targetProfileOptional = userProfileRepository.findByUserUuid(targetUserUuid);
    if (targetProfileOptional.isEmpty()) return Optional.empty();

    UserProfile targetProfile = targetProfileOptional.get();

    String username = targetUser.getUsername();
    String profilePicture = targetProfile.getProfilePictureUrl();
    boolean isFollowing = targetUser.getFollowers().contains(viewer);
    Long targetFollowingAmount = targetUser.getFollowingAmount();
    Long targetFollowerAmount = targetUser.getFollowerAmount();
    boolean isPrivate = isPrivateAccount(targetUser);
    boolean canViewPrivateContent = canViewPrivateContent(viewer, targetUser);
    String biography = (isPrivate && !canViewPrivateContent) ? null : targetProfile.getBiography();

    boolean followRequestPending = false;
    if (!isFollowing) {
      followRequestPending = followRequestRepository.existsByRequesterIdAndRequestedId(
          viewerId,
          targetUser.getId()
      );
    }

    ConnectionProfileDTO dto = new ConnectionProfileDTO(
        username,
        biography,
        profilePicture,
        isFollowing,
        targetFollowingAmount,
        targetFollowerAmount,
        isPrivate,
        canViewPrivateContent
    );

    dto.setFollowRequestPending(followRequestPending);

    return Optional.of(dto);
  }



  public Optional<ConnectionProfileDTO> getRelationshipProfileByUsername(Long viewerId, String username) {
    String trimmedUsername = username.trim();
    Optional<User> viewerOptional = userRepository.findById(viewerId);
    if (viewerOptional.isEmpty()) {
      return Optional.empty();
    }

    User viewer = viewerOptional.get();
    Optional<User> targetUserOptional = userRepository.findByUsername(trimmedUsername);

    if (targetUserOptional.isPresent()) {
      User targetUser = targetUserOptional.get();

      Optional<UserProfile> targetProfileOptional = userProfileRepository.findByUserUuid(targetUser.getUuid());
      if (targetProfileOptional.isEmpty()) {
        return Optional.empty();
      }

      UserProfile targetProfile = targetProfileOptional.get();

      String targetUsername = targetUser.getUsername();
      String targetProfilePicture = targetProfile.getProfilePictureUrl();
      boolean isFollowing = targetUser.getFollowers().contains(viewer);
      Long targetFollowingAmount = targetUser.getFollowingAmount();
      Long targetFollowerAmount = targetUser.getFollowerAmount();

      boolean isPrivate = isPrivateAccount(targetUser);
      boolean canViewPrivateContent = canViewPrivateContent(viewer, targetUser);

      // Si es una cuenta privada y no puede ver contenido privado, ocultar biografía
      String targetBiography = (isPrivate && !canViewPrivateContent) ? null : targetProfile.getBiography();

      ConnectionProfileDTO connectionProfileDTO = new ConnectionProfileDTO(
          targetUsername,
          targetBiography,
          targetProfilePicture,
          isFollowing,
          targetFollowingAmount,
          targetFollowerAmount,
          isPrivate,
          canViewPrivateContent);
      return Optional.of(connectionProfileDTO);
    }
    return Optional.empty();
  }

  public UserPostsDTO getAllRelationshipPosts(Long viewerId, UUID uuid) {
    Optional<User> viewerOptional = userRepository.findById(viewerId);
    Optional<User> targetUserOptional = userRepository.findByUuid(uuid);

    if (viewerOptional.isEmpty() || targetUserOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User viewer = viewerOptional.get();
    User targetUser = targetUserOptional.get();

    // Verificar si puede ver el contenido privado
    if (!canViewPrivateContent(viewer, targetUser)) {
      // Retornar DTO vacío si no puede ver los posts
      UserDTO userDTO = new UserDTO(targetUser.getId(), targetUser.getUuid(),
          targetUser.getUsername(), targetUser.getEmail());
      return new UserPostsDTO(userDTO, Collections.emptySet(), Collections.emptySet());
    }

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

    UserDTO userDTO = new UserDTO(targetUser.getId(), targetUser.getUuid(),
        targetUser.getUsername(), targetUser.getEmail());
    return new UserPostsDTO(userDTO, experienceDTOs, suggestionDTOs);
  }

  public Set<ExperienceDTO> getAllRelationshipExperiences(Long viewerId, UUID uuid) {
    Optional<User> viewerOptional = userRepository.findById(viewerId);
    Optional<User> targetUserOptional = userRepository.findByUuid(uuid);

    if (viewerOptional.isEmpty() || targetUserOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User viewer = viewerOptional.get();
    User targetUser = targetUserOptional.get();

    // Verificar si puede ver el contenido privado
    if (!canViewPrivateContent(viewer, targetUser)) {
      return Collections.emptySet();
    }

    Set<Experience> experiences = experienceRepository.getExperiencesByUserUuid(uuid);
    if (experiences.isEmpty()) return Collections.emptySet();

    Set<ExperienceDTO> experiencesDTOset = new HashSet<>();
    for (Experience e : experiences) {
      experiencesDTOset.add(new ExperienceDTO(e));
    }

    return experiencesDTOset;
  }

  public Set<SuggestionDTO> getAllRelationshipSuggestions(Long viewerId, UUID uuid) {
    Optional<User> viewerOptional = userRepository.findById(viewerId);
    Optional<User> targetUserOptional = userRepository.findByUuid(uuid);

    if (viewerOptional.isEmpty() || targetUserOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User viewer = viewerOptional.get();
    User targetUser = targetUserOptional.get();

    // Verificar si puede ver el contenido privado
    if (!canViewPrivateContent(viewer, targetUser)) {
      return Collections.emptySet();
    }

    Set<Suggestion> suggestions = suggestionRepository.getSuggestionsByUserUuid(uuid);
    if (suggestions.isEmpty()) return Collections.emptySet();

    Set<SuggestionDTO> suggestionDTOset = new HashSet<>();
    for (Suggestion s : suggestions) {
      suggestionDTOset.add(new SuggestionDTO(s));
    }

    return suggestionDTOset;
  }

  public Set<ConnectionDTO> getRelationshipFollowers(Long viewerId, UUID uuid) {
    Optional<User> viewerOptional = userRepository.findById(viewerId);
    Optional<User> targetUserOptional = userRepository.findByUuid(uuid);

    if (viewerOptional.isEmpty() || targetUserOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User viewer = viewerOptional.get();
    User targetUser = targetUserOptional.get();

    // Verificar si puede ver el contenido privado
    if (!canViewPrivateContent(viewer, targetUser)) {
      return Collections.emptySet();
    }

    Set<ConnectionDTO> followers = new HashSet<>();
    for (User u : targetUser.getFollowers()) {
      Optional<UserProfile> userProfileOptional = userProfileRepository.findById(u.getId());
      if (userProfileOptional.isPresent()) {
        UserProfile userProfile = userProfileOptional.get();
        String profilePicture = userProfile.getProfilePictureUrl();
        followers.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), profilePicture));
      }
    }
    return followers;
  }

  public Set<ConnectionDTO> getRelationshipFollowing(Long viewerId, UUID uuid) {
    Optional<User> viewerOptional = userRepository.findById(viewerId);
    Optional<User> targetUserOptional = userRepository.findByUuid(uuid);

    if (viewerOptional.isEmpty() || targetUserOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User viewer = viewerOptional.get();
    User targetUser = targetUserOptional.get();

    // Verificar si puede ver el contenido privado
    if (!canViewPrivateContent(viewer, targetUser)) {
      return Collections.emptySet();
    }

    Set<ConnectionDTO> following = new HashSet<>();
    for (User u : targetUser.getFollowing()) {
      Optional<UserProfile> userProfileOptional = userProfileRepository.findById(u.getId());
      if (userProfileOptional.isPresent()) {
        UserProfile userProfile = userProfileOptional.get();
        String profilePicture = userProfile.getProfilePictureUrl();
        following.add(new ConnectionDTO(u.getUuid(), u.getUsername(), u.getEmail(), profilePicture));
      }
    }
    return following;
  }
}