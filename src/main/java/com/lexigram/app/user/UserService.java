package com.lexigram.app.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  private final UserRepository userRepository;

  @Autowired
  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
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
    userRepository.save(user);

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
    Optional<User> optionalUser = userRepository.findById(id);
    if (optionalUser.isPresent()) {
      userRepository.deleteById(id);
      return true;
    }
    return false;
  }

}
