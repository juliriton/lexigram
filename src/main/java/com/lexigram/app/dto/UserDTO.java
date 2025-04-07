package com.lexigram.app.dto;

public class UserDTO {
  private Long id;
  private String username;
  private String email;

  public UserDTO() {}

  public UserDTO(Long id, String username, String email) {
    this.id = id;
    this.username = username;
    this.email = email;
  }

  public Long getId() { return this.id; }

  public String getUsername() {
    return this.username;
  }

  public String getEmail() {
    return this.email;
  }

}
