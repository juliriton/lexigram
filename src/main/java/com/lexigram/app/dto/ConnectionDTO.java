package com.lexigram.app.dto;

public class ConnectionDTO {

  private Long id;
  private String username;
  private String email;
  private String profilePictureUrl;

  public ConnectionDTO() {}

  public ConnectionDTO(Long id, String username, String email, String profilePictureUrl) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.profilePictureUrl = profilePictureUrl;
  }

  public Long getId() { return this.id; }

  public String getUsername() {
    return this.username;
  }

  public String getEmail() {
    return this.email;
  }

  public String getProfilePictureUrl() {
    return this.profilePictureUrl;
  }

}
