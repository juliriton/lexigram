package com.lexigram.app.user;

public class UserDTO {
  private String username;
  private String email;

  public UserDTO() {}

  public UserDTO(String username, String email) {
    this.username = username;
    this.email = email;
  }

  public String getUsername() {
    return username;
  }

  public String getEmail() {
    return email;
  }

}
