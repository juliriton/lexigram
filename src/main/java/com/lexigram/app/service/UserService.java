package com.lexigram.app.service;

import com.lexigram.app.dto.*;
import com.lexigram.app.exception.EmailAlreadyUsedException;
import com.lexigram.app.exception.UserNotFoundException;
import com.lexigram.app.exception.UsernameAlreadyUsedException;
import com.lexigram.app.exception.WrongPasswordException;
import com.lexigram.app.model.User;
import com.lexigram.app.model.UserPrivacySettings;
import com.lexigram.app.model.UserProfile;
import com.lexigram.app.repository.UserPrivacySettingsRepository;
import com.lexigram.app.repository.UserProfileRepository;
import com.lexigram.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final UserPrivacySettingsRepository userPrivacySettingsRepository;
  private final UserProfileRepository userProfileRepository;
  private PasswordEncoder passwordEncoder;

  @Autowired
  public UserService(UserRepository userRepository,
                     UserPrivacySettingsRepository userPrivacySettingsRepository,
                     UserProfileRepository userProfileRepository,
                     PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.userPrivacySettingsRepository = userPrivacySettingsRepository;
    this.userProfileRepository = userProfileRepository;
    this.passwordEncoder = passwordEncoder;
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

    if (newEmail != null && !newEmail.isEmpty()) {
      user.setEmail(dto.getEmail());
    }

    userRepository.save(user);
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

    if (newUsername != null && !newUsername.isEmpty()) {
      user.setUsername(newUsername);;
    }

    userRepository.save(user);
    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
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
    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
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

    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
  }

}
