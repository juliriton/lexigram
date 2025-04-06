package com.lexigram.app.controller;

import com.lexigram.app.dto.UserCreateDTO;
import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.service.UserService;
import com.lexigram.app.dto.UserUpdateDTO;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    if (users.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(users);
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
    Optional<UserDTO> userOptional = userService.findUserById(id);

    if (userOptional.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    UserDTO user = userOptional.get();
    return ResponseEntity.ok(new UserDTO(user.getId(), user.getUsername(), user.getEmail()));
  }

  @PutMapping("/{id}")
  public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                            @Valid @RequestBody UserUpdateDTO dto) {
    Optional<UserDTO> userOptional = userService.findUserById(id);

    if (userOptional.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    Optional<UserDTO> updatedUser = userService.updateUser(id, dto);
    return ResponseEntity.ok(updatedUser.get());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    if (userService.deleteUser(id)) {
      return ResponseEntity.noContent().build();
    } else {
      return ResponseEntity.notFound().build();
    }
  }

}
