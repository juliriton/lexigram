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
      userDTOs.add(new UserDTO(user.getUsername(), user.getEmail()));
    }
    return userDTOs;
  }

  public UserDTO createUser(UserCreateDTO dto) {
    User user = new User();
    user.setUsername(dto.getUsername());
    user.setEmail(dto.getEmail());
    user.setPassword(dto.getPassword());
    userRepository.save(user);

    return new UserDTO(user.getUsername(), user.getEmail());
  }

  public Optional<UserDTO> findUserById(Long id) {
    Optional<User> userOptional = userRepository.findById(id);
    if (userOptional.isPresent()) {
      User user = userOptional.get();
      return Optional.of(new UserDTO(user.getUsername(), user.getEmail()));
    }
    return Optional.empty();
  }

  public Optional<UserDTO> updateUser(Long id, UserUpdateDTO userUpdateDTO) {
    Optional<User> optionalUser = userRepository.findById(id);

    if (optionalUser.isPresent()) {
      User user = optionalUser.get();

      if (userUpdateDTO.getUsername() != null) {
        user.setUsername(userUpdateDTO.getUsername());
      }
      if (userUpdateDTO.getEmail() != null) {
        user.setEmail(userUpdateDTO.getEmail());
      }
      if (userUpdateDTO.getPassword() != null) {
        user.setPassword(userUpdateDTO.getPassword());
      }

      userRepository.save(user);
      return Optional.of(new UserDTO(user.getUsername(), user.getEmail()));
    }

    return Optional.empty();
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
