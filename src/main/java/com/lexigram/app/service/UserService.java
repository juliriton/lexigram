package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.EmailAlreadyUsedException;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.exception.UsernameAlreadyUsedException;
import com.lexigram.app.model.User;
import com.lexigram.app.model.UserPrivacySettings;
import com.lexigram.app.model.UserProfile;
import com.lexigram.app.repository.UserPrivacySettingsRepository;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final UserPrivacySettingsRepository userPrivacySettingsRepository;
  private final UserProfileRepository userProfileRepository;

  @Autowired
  public UserService(UserRepository userRepository,
                     UserPrivacySettingsRepository userPrivacySettingsRepository,
                     UserProfileRepository userProfileRepository) {
    this.userRepository = userRepository;
    this.userPrivacySettingsRepository = userPrivacySettingsRepository;
    this.userProfileRepository = userProfileRepository;
  }

  public List<UserDTO> findAllUsers() {
    List<User> users = userRepository.findAll();
    List<UserDTO> userDTOs = new ArrayList<>();
    for (User user : users) {
      userDTOs.add(new UserDTO(user.getId(), user.getUsername(), user.getEmail()));
    }
    return userDTOs;
  }

  public Optional<UserDTO> findUserById(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      return Optional.empty();
    }
    User user = userOptional.get();
    return Optional.of(new UserDTO(user.getId(), user.getUsername(), user.getEmail()));
  }

  public UserDTO createUser(UserCreateDTO dto) {
    User user = new User();
    user.setUsername(dto.getUsername());
    user.setEmail(dto.getEmail());
    user.setPassword(dto.getPassword());
    userRepository.save(user); // Guardo el usuario primero para generar el ID

    UserPrivacySettings userPrivacySettings = new UserPrivacySettings(user);
    UserProfile userProfile = new UserProfile(user);

    userProfile.setBiography("No bio yet — still searching for the right words.");
    userProfile.setProfilePictureUrl("http://localhost:8080/images/default-profile-picture.png");
    userPrivacySettingsRepository.save(userPrivacySettings);
    userProfileRepository.save(userProfile);
    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
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

    Boolean updated = false;

    if (newEmail != null && !newEmail.isEmpty() && !newEmail.equals(user.getEmail())) {
      user.setEmail(dto.getEmail());
      updated = true;
    }

    if (updated) {
      userRepository.save(user);
    }

    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
  }

  public boolean deleteUser(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isPresent()) {
      userRepository.deleteById(id);
      return true;
    }
    return false;
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

    boolean updated = false;

    if (newUsername != null && !newUsername.isEmpty() && !newUsername.equals(user.getUsername())) {
      user.setUsername(newUsername);
      updated = true;
    }

    if (updated) {
      userRepository.save(user);
    }

    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
  }

  public UserDTO updateUserPassword(Long id, UserUpdatePasswordDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      throw new UserNotFoundException();
    }

    User user = userOptional.get();
    String newPassword = dto.getPassword();
    Boolean updated = false;

    if (newPassword != null && !newPassword.isEmpty() && !newPassword.equals(user.getEmail())) {
      user.setPassword(dto.getPassword());
      updated = true;
    }

    if (updated) {
      userRepository.save(user);
    }

    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
  }

}
