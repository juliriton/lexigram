package com.lexigram.app.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserUpdateUsernameDTO {

  @Size(min = 3, max = 25, message = "Username must be between 3 and 25 characters")
  @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
  private String username;

  public UserUpdateUsernameDTO() {}

  public UserUpdateUsernameDTO(String username) {
    this.username = username;
  }

  public String getUsername() {
    return this.username;
  }
}
