package com.lexigram.app.controller;

import com.lexigram.app.dto.UserLoginDTO;
import com.lexigram.app.dto.UserDTO;
import com.lexigram.app.dto.UserSignUpDTO;
import com.lexigram.app.service.UserService;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;

@RestController
@RequestMapping("/api/auth/")
public class AuthController {

  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
  private final UserService userService;

  @Autowired
  public AuthController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/signup")
  public ResponseEntity<UserDTO> signup(@Valid @RequestBody UserSignUpDTO dto,
                                        HttpSession session,
                                        HttpServletRequest request,
                                        HttpServletResponse response) {
    logger.info("Signup request received");
    logger.info("Session ID before signup: {}", session.getId());

    UserDTO createdUser = userService.signUp(dto);
    session.setAttribute("user", createdUser.getId());

    logger.info("User created with ID: {}", createdUser.getId());
    logger.info("Session ID after signup: {}", session.getId());
    logger.info("Session attribute set: {}", session.getAttribute("user"));

    return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
  }

  @PostMapping("/login")
  public ResponseEntity<UserDTO> login(@RequestBody UserLoginDTO dto,
                                       HttpSession session,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
    logger.info("Login request received");
    logger.info("Session ID before login: {}", session.getId());

    UserDTO user = userService.login(dto);
    session.setAttribute("user", user.getId());

    logger.info("User logged in with ID: {}", user.getId());
    logger.info("Session ID after login: {}", session.getId());
    logger.info("Session attribute set: {}", session.getAttribute("user"));

    return ResponseEntity.ok(user);
  }

  @GetMapping("/me")
  public ResponseEntity<UserDTO> getCurrentUser(HttpSession session, HttpServletRequest request) {
    logger.info("getCurrentUser request received");
    logger.info("Session ID: {}", session.getId());
    logger.info("Session is new: {}", session.isNew());

    Long id = (Long) session.getAttribute("user");
    logger.info("User ID from session: {}", id);

    // Log session attributes
    logger.info("All session attributes:");
    session.getAttributeNames().asIterator().forEachRemaining(name ->
        logger.info("  {} = {}", name, session.getAttribute(name))
    );

    // Log request headers
    logger.info("Request headers:");
    request.getHeaderNames().asIterator().forEachRemaining(headerName ->
        logger.info("  {} = {}", headerName, request.getHeader(headerName))
    );

    if (id == null) {
      logger.warn("No user ID found in session");
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    UserDTO user = userService.findUserById(id).orElse(null);
    if (user == null) {
      logger.warn("User not found for ID: {}", id);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    logger.info("User found: {}", user.getId());
    return ResponseEntity.ok(user);
  }

  @PostMapping("/me/logout")
  public ResponseEntity<?> logout(HttpSession session) {
    logger.info("Logout request received");
    logger.info("Session ID before logout: {}", session.getId());

    session.invalidate();

    logger.info("Session invalidated");
    return ResponseEntity.ok("Logged out successfully");
  }
}