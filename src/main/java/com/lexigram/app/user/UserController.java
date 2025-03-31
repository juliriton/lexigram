package com.lexigram.app.user;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  @Autowired
  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping
  public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
    User user = userService.createUser(userDTO.getUsername(), userDTO.getEmail(), userDTO.getPassword());
    return ResponseEntity.status(201).body(new UserDTO(user.getUsername(), user.getEmail()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
    Optional<User> userOptional = userService.findUserById(id);

    if (userOptional.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    User user = userOptional.get();
    return ResponseEntity.ok(new UserDTO(user.getUsername(), user.getEmail()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
    User updatedUser = userService.updateUser(id, userDTO.getUsername(), userDTO.getEmail(), userDTO.getPassword());
    return ResponseEntity.ok(new UserDTO(updatedUser.getUsername(), updatedUser.getEmail()));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
