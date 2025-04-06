package com.lexigram.app.dto;

import jakarta.validation.constraints.*;

public class UserUpdateEmailDTO {

  @Email(message = "Invalid email address")
  private String email;

  public UserUpdateEmailDTO() {}

  public UserUpdateEmailDTO(String email) {
    this.email = email;
  }

  public String getEmail() {
    return email;
  }

}
