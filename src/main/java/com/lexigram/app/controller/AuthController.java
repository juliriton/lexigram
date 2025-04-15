package com.lexigram.app.controller;

import com.lexigram.app.dto.UserLoginDTO;
import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.dto.UserSignUpDTO;
import com.lexigram.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth/")
public class AuthController {

  private final UserService userService;

  @Autowired
  public AuthController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/signup")
  public ResponseEntity<UserDTO> signup(@Valid @RequestBody UserSignUpDTO dto, HttpSession session) {
    UserDTO createdUser = userService.signUp(dto);
    session.setAttribute("user", createdUser.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
  }

  @PostMapping("/login")
  public ResponseEntity<UserDTO> login(@RequestBody UserLoginDTO dto, HttpSession session) {
    UserDTO user = userService.login(dto);
    session.setAttribute("user", user.getId());
    return ResponseEntity.ok(user);
  }

  //Verificar si usuario esta logeado
  @GetMapping("/me")
  public ResponseEntity<UserDTO> getCurrentUser(HttpSession session) {
    Long id = (Long) session.getAttribute("user");

    if (id == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    UserDTO user = userService.findUserById(id).orElse(null);
    if (user == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(user);
  }

  @PostMapping("/me/logout")
  public ResponseEntity<?> logout(HttpSession session) {
    session.invalidate();
    return ResponseEntity.ok("Logged out successfully");
  }
}
