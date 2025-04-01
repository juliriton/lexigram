package com.lexigram.app.user;

public class UserUpdateDTO {
    private String username;
    private String email;
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
