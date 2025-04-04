package com.lexigram.app.service;

import com.lexigram.app.model.User;
import com.lexigram.app.dto.UserCreateDTO;
import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.model.UserPrivacySettings;
import com.lexigram.app.repository.UserPrivacySettingsRepository;
import com.lexigram.app.repository.UserRepository;
import com.lexigram.app.dto.UserUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final UserPrivacySettingsRepository userPrivacySettingsRepository;

  @Autowired
  public UserService(UserRepository userRepository, UserPrivacySettingsRepository userPrivacySettingsRepository) {
    this.userRepository = userRepository;
    this.userPrivacySettingsRepository = userPrivacySettingsRepository;
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
    return Optional.of( new UserDTO(user.getId(), user.getUsername(), user.getEmail()));
  }

  public UserDTO createUser(UserCreateDTO dto) {
    User user = new User();
    user.setUsername(dto.getUsername());
    user.setEmail(dto.getEmail());
    user.setPassword(dto.getPassword());
    userRepository.save(user); // Guardo el usuario primero para generar el ID

    UserPrivacySettings userPrivacySettings = new UserPrivacySettings(user);
    userPrivacySettingsRepository.save(userPrivacySettings);
    return new UserDTO(user.getId(), user.getUsername(), user.getEmail());
  }

  public Optional<UserDTO> updateUser(Long id, UserUpdateDTO dto) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isEmpty()) {
      return Optional.empty();
    }

    User user = userOptional.get();
    boolean updated = false;

    if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
      user.setUsername(dto.getUsername());
      updated = true;
    }

    if (dto.getEmail() != null && !dto.getEmail().isEmpty() && !dto.getEmail().equals(user.getEmail())) {
      user.setEmail(dto.getEmail());
      updated = true;
    }

    if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
      user.setPassword(dto.getPassword());
      updated = true;
    }

    if (updated) {
      userRepository.save(user);
    }

    return Optional.of(new UserDTO(user.getId(), user.getUsername(), user.getEmail()));
  }

  public boolean deleteUser(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isPresent()) {
      userRepository.deleteById(id);
      return true;
    }
    return false;
  }

}
