package com.lexigram.app.dto;

import jakarta.validation.constraints.*;

public class UserSignUpDTO {

  @NotEmpty(message = "Username is required")
  @NotBlank
  @Size(min = 3, max = 25, message = "Username must be between 3 and 25 characters")
  @Pattern(regexp = "^[a-z0-9_]+$", message = "Username must be lowercase, can only contain letters, numbers, and underscores")
  private String username;

  @NotEmpty(message = "Email is required")
  @NotBlank
  @Email(message = "Invalid email address")
  private String email;

  @NotEmpty(message = "Password is required")
  @NotBlank
  @Size(min = 6, message = "Password must be at least 6 characters")
  private String password;

  public UserSignUpDTO() {}

  public UserSignUpDTO(String username, String email, String password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  public String getUsername() {
    return username;
  }

  public String getEmail() {
    return email;
  }

  public String getPassword() {
    return password;
  }

}

