package com.lexigram.app.dto;

import jakarta.validation.constraints.Size;

public class UserUpdatePasswordDTO {

  @Size(min = 6, message = "Password must be at least 6 characters")
  private String password;

  public UserUpdatePasswordDTO() {}

  public UserUpdatePasswordDTO(String password) {
    this.password = password;
  }

  public String getPassword() {
    return this.password;
  }

}
