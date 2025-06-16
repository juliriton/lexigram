package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.EmailAlreadyUsedException;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.exception.UsernameAlreadyUsedException;
import com.lexigram.app.exception.WrongPasswordException;
import com.lexigram.app.model.Notification;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.user.User;
import com.lexigram.app.model.user.UserPrivacySettings;
import com.lexigram.app.model.user.UserProfile;
import com.lexigram.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final UserPrivacySettingsRepository userPrivacySettingsRepository;
  private final UserProfileRepository userProfileRepository;
  private final ExperienceRepository experienceRepository;
  private final PasswordEncoder passwordEncoder;
  private final NotificationService notificationService;
  private final NotificationRepository notificationRepository;

  @Autowired
  public UserService(UserRepository userRepository,
                     UserPrivacySettingsRepository userPrivacySettingsRepository,
                     UserProfileRepository userProfileRepository,
                     ExperienceRepository experienceRepository,
                     PasswordEncoder passwordEncoder, NotificationService notificationService, NotificationRepository notificationRepository) {
    this.userRepository = userRepository;
    this.userPrivacySettingsRepository = userPrivacySettingsRepository;
    this.userProfileRepository = userProfileRepository;
    this.experienceRepository = experienceRepository;
    this.passwordEncoder = passwordEncoder;
    this.notificationService = notificationService;
    this.notificationRepository = notificationRepository;
  }

  public List<UserDTO> findAllUsers() {
    List<User> users = userRepository.findAll();
    List<UserDTO> userDTOs = new ArrayList<>();
    for (User user : users) {
      userDTOs.add(new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail()));
    }
    return userDTOs;
  }

  public Optional<UserDTO> findUserById(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      return Optional.empty();
    }
    User user = userOptional.get();
    return Optional.of(new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail()));
  }

  public UserDTO signUp(UserSignUpDTO dto) {
    String username = dto.getUsername();
    String email = dto.getEmail();
    String password = dto.getPassword();

    if (userRepository.existsByUsername(username)) {
      throw new UsernameAlreadyUsedException();
    } else if (userRepository.existsByEmail(email)) {
      throw new EmailAlreadyUsedException();
    }

    User user = new User();
    user.setUsername(username);
    user.setEmail(email);
    String hashedPassword = passwordEncoder.encode(password);
    user.setPassword(hashedPassword);
    userRepository.save(user); // Guardo el usuario primero para generar el ID

    UserPrivacySettings userPrivacySettings = new UserPrivacySettings(user);
    UserProfile userProfile = new UserProfile(user);

    userProfile.setBiography("No bio yet — still searching for the right words.");
    userProfile.setProfilePictureUrl("http://localhost:8080/images/default-profile-picture.png");
    userPrivacySettingsRepository.save(userPrivacySettings);
    userProfileRepository.save(userProfile);
    return new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail());
  }

  public UserDTO updateUserEmail(Long id, UserUpdateEmailDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    String newEmail = dto.getEmail();

    if (!user.getUsername().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
      throw new EmailAlreadyUsedException();
    }

    if (newEmail != null && !newEmail.isEmpty()) {
      user.setEmail(dto.getEmail());
    }

    userRepository.save(user);
    return new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail());
  }

  public boolean deleteUser(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) return false;

    User user = userOptional.get();

    for (User follower : new HashSet<>(user.getFollowers())) {
      follower.removeFollowing(user);
      userRepository.save(follower);
    }

    for (User following : new HashSet<>(user.getFollowing())) {
      following.removeFollower(user);
      userRepository.save(following);
    }

    for (Experience experience : new HashSet<>(user.getMentionedIn())) {
      experience.getMentions().remove(user);
      experienceRepository.save(experience);
    }

    user.getFollowers().clear();
    user.getFollowing().clear();
    user.getMentionedIn().clear();

    userRepository.delete(user);
    return true;
  }


  public UserDTO updateUserUsername(Long id, UserUpdateUsernameDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    String newUsername = dto.getUsername();

    if (!user.getUsername().equals(newUsername) &&
        userRepository.existsByUsername(newUsername)) {
      throw new UsernameAlreadyUsedException();
    }

    if (newUsername != null && !newUsername.isEmpty()) {
      user.setUsername(newUsername);;
    }

    userRepository.save(user);
    return new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail());
  }

  public UserDTO updateUserPassword(Long id, UserUpdatePasswordDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    String newPassword = dto.getPassword();

    if (newPassword != null && !newPassword.isEmpty()) {
      String hashedPassword = passwordEncoder.encode(newPassword);
      user.setPassword(hashedPassword);
    }

    userRepository.save(user);
    return new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail());
  }

  public UserDTO login(UserLoginDTO dto) {
    Optional<User> userOptional;

    if (dto.getCredential().contains("@")) {
      userOptional = userRepository.findByEmail(dto.getCredential());
    } else {
      userOptional = userRepository.findByUsername(dto.getCredential());
    }

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    boolean passwordMatches = passwordEncoder.matches(dto.getPassword(), user.getPassword());

    if (!passwordMatches) {
      throw new WrongPasswordException();
    }

    return new UserDTO(user.getId(), user.getUuid(), user.getUsername(), user.getEmail());
  }

  public Optional<ConnectionDTO> followUser(Long id, UUID toFollowUuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<User> toFollowOptional = userRepository.findByUuid(toFollowUuid);

    if (toFollowOptional.isPresent()) {
      User toFollow = toFollowOptional.get();

      if (toFollow.getFollowers().contains(user)) {
        throw new UnsupportedOperationException();
      }

      UserProfile toFollowProfile = userProfileRepository.findById(toFollow.getId()).get();
      user.addFollowing(toFollow);
      toFollow.addFollower(user);

      Notification notification = notificationService.createFollowNotification(user, toFollow);
      notificationRepository.save(notification);

      userRepository.save(user);
      userRepository.save(toFollow);
      return Optional.of(new ConnectionDTO(toFollow.getUuid(),
          toFollow.getUsername(),
          toFollow.getEmail(),
          toFollowProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

  public Optional<ConnectionDTO> unfollowUser(Long id, UUID toUnfollowUuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }
    User user = userOptional.get();
    Optional<User> toUnfollowOptional = userRepository.findByUuid(toUnfollowUuid);

    if (toUnfollowOptional.isPresent()) {
      User toUnfollow = toUnfollowOptional.get();
      UserProfile toUnfollowProfile = userProfileRepository.findById(toUnfollow.getId()).get();
      user.removeFollowing(toUnfollow);
      toUnfollow.removeFollower(user);

      userRepository.save(user);
      userRepository.save(toUnfollow);
      return Optional.of(new ConnectionDTO(toUnfollow.getUuid(),
          toUnfollow.getUsername(),
          toUnfollow.getEmail(),
          toUnfollowProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

  public Optional<ConnectionDTO> removeFollower(Long id, UUID toRemoveUuid) {
    Optional<User> userOptional = userRepository.findById(id);

    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    Optional<User> toRemoveOptional = userRepository.findByUuid(toRemoveUuid);

    if (toRemoveOptional.isPresent()) {
      User toRemove = toRemoveOptional.get();
      UserProfile toRemoveProfile = userProfileRepository.findById(toRemove.getId()).get();
      user.removeFollower(toRemove);
      userRepository.save(user);
      return Optional.of(new ConnectionDTO(toRemove.getUuid(),
          toRemove.getUsername(),
          toRemove.getEmail(),
          toRemoveProfile.getProfilePictureUrl()));
    }
    return Optional.empty();
  }

}
