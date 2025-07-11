package com.lexigram.app.controller;

import com.lexigram.app.dto.*;
import com.lexigram.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/auth/me")
public class UserController {

  private final UserService userService;

  @Autowired
  public UserController(UserService userService) {
    this.userService = userService;
  }

  @DeleteMapping
  public ResponseEntity<Void> deleteUser(HttpSession session) {
    Long id = (Long) session.getAttribute("user");
    userService.deleteUser(id);
    session.invalidate();
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/email")
  public ResponseEntity<UserDTO> updateEmail(HttpSession session,
                                             @Valid @RequestBody UserUpdateEmailDTO dto) {
    Long id = (Long) session.getAttribute("user");
    return ResponseEntity.ok(userService.updateUserEmail(id, dto));
  }

  @PutMapping("/username")
  public ResponseEntity<UserDTO> updateUsername(HttpSession session,
                                                @Valid @RequestBody UserUpdateUsernameDTO dto) {
    Long id = (Long) session.getAttribute("user");
    return ResponseEntity.ok(userService.updateUserUsername(id, dto));
  }

  @PutMapping("/password")
  public ResponseEntity<UserDTO> updatePassword(HttpSession session,
                                                @Valid @RequestBody UserUpdatePasswordDTO dto) {
    Long id = (Long) session.getAttribute("user");
    return ResponseEntity.ok(userService.updateUserPassword(id, dto));
  }
}

