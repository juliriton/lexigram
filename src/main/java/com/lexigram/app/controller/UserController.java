package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  @Autowired
  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/me")
  public ResponseEntity<UserDTO> getCurrentUser(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    if (id == null) return ResponseEntity.status(401).build();

    Optional<UserDTO> user = userService.findUserById(id);
    if (user.isEmpty()) return ResponseEntity.notFound().build();

    return ResponseEntity.ok(user.get());
  }

  @PutMapping("/me/email")
  public ResponseEntity<UserDTO> updateEmail(HttpSession session,
                                             @Valid @RequestBody UserUpdateEmailDTO dto) {
    Long id = (Long) session.getAttribute("user");
    return ResponseEntity.ok(userService.updateUserEmail(id, dto));
  }

  @PutMapping("/me/username")
  public ResponseEntity<UserDTO> updateUsername(HttpSession session,
                                                @Valid @RequestBody UserUpdateUsernameDTO dto) {
    Long id = (Long) session.getAttribute("user");
    return ResponseEntity.ok(userService.updateUserUsername(id, dto));
  }

  @PutMapping("/me/password")
  public ResponseEntity<UserDTO> updatePassword(HttpSession session,
                                                @Valid @RequestBody UserUpdatePasswordDTO dto) {
    Long id = (Long) session.getAttribute("user");
    return ResponseEntity.ok(userService.updateUserPassword(id, dto));
  }

  @DeleteMapping("/me")
  public ResponseEntity<Void> deleteUser(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    userService.deleteUser(id);
    session.invalidate();
    return ResponseEntity.noContent().build();
  }

  @GetMapping
  public ResponseEntity<List<UserDTO>> getAllUsers() {
    return ResponseEntity.ok(userService.findAllUsers());
  }
}

