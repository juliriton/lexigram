package com.lexigram.app.user;

import jakarta.validation.constraints.*;

public class UserDTO {

  @NotEmpty(message = "Username is required")
  @Size(min = 3, max = 25, message = "Username must be between 3 and 25 characters")
  @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
  private String username;

  @NotEmpty(message = "Email is required")
  @Email(message = "Invalid email address")
  private String email;

  @NotNull(message = "Password is required")
  @Size(min = 6, message = "Password must be at least 6 characters")
  private String password;

  public UserDTO() { }

  // Constructor para devolver datos del usuario sin la password
  public UserDTO(String username, String email) {
    this.username = username;
    this.email = email;
  }

  public UserDTO(String username, String email, String password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }
}
