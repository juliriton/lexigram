package com.lexigram.app.user;

import jakarta.validation.constraints.*;

public class UserUpdateDTO {

  @Size(min = 3, max = 25, message = "Username must be between 3 and 25 characters")
  @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
  private String username;

  @Email(message = "Invalid email address")
  private String email;

  @Size(min = 6, message = "Password must be at least 6 characters")
  private String password;

  public UserUpdateDTO() {}

  public UserUpdateDTO(String username, String email, String password) {
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
