package com.lexigram.app.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

  private final UserRepository userRepository;

  @Autowired
  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public List<User> findAllUsers() {
    return userRepository.findAll();
  }

  public User createUser(String username, String email, String password) {
    User user = new User();
    user.setUsername(username);
    user.setEmail(email);
    user.setPassword(password);
    return userRepository.save(user);
  }

  public Optional<User> findUserById(Long id) {
    return userRepository.findById(id);
  }

  public User updateUser(Long id, String username, String email, String password) {
    Optional<User> optionalUser = userRepository.findById(id);
    if (optionalUser.isPresent()) {
      User user = optionalUser.get();
      user.setUsername(username);
      user.setEmail(email);
      user.setPassword(password);
      return userRepository.save(user);
    }
    return null;
  }

  public void deleteUser(Long id) {
    userRepository.deleteById(id);
  }
}
