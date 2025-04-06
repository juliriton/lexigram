package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  @Autowired
  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping
  public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserCreateDTO dto) {
    UserDTO user = userService.createUser(dto);
    return ResponseEntity.status(201).body(user);
  }

  @GetMapping
  public ResponseEntity<List<UserDTO>> getAllUsers() {
    List<UserDTO> users = userService.findAllUsers();
    return ResponseEntity.ok(users);
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
    Optional<UserDTO> user = userService.findUserById(id);
    if (user.isPresent()) {
      return ResponseEntity.ok(user.get());
    }
    return ResponseEntity.notFound().build();
  }

  @PutMapping("/{id}/email")
  public ResponseEntity<UserDTO> updateUserEmail(@PathVariable Long id,
                                                 @Valid @RequestBody UserUpdateEmailDTO dto) {
    UserDTO updatedUser = userService.updateUserEmail(id, dto);
    return ResponseEntity.ok(updatedUser);
  }

  @PutMapping("/{id}/username")
  public ResponseEntity<UserDTO> updateUserUsername(@PathVariable Long id,
                                                    @Valid @RequestBody UserUpdateUsernameDTO dto) {
    UserDTO updatedUser = userService.updateUserUsername(id, dto);
    return ResponseEntity.ok(updatedUser);
  }

  @PutMapping("/{id}/password")
  public ResponseEntity<UserDTO> updateUserPassword(@PathVariable Long id,
                                                    @Valid @RequestBody UserUpdatePasswordDTO dto) {
    UserDTO updatedUser = userService.updateUserPassword(id, dto);
    return ResponseEntity.ok(updatedUser);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.deleteUser(id);
    return ResponseEntity.noContent().build();
  }
}
