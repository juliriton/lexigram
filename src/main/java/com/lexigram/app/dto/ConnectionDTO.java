package com.lexigram.app.dto;

import java.util.UUID;

public class ConnectionDTO {

  private UUID uuid;
  private String username;
  private String email;
  private String profilePictureUrl;

  public ConnectionDTO() {}

  public ConnectionDTO(UUID uuid, String username, String email, String profilePictureUrl) {
    this.uuid = uuid;
    this.username = username;
    this.email = email;
    this.profilePictureUrl = profilePictureUrl;
  }

  public UUID getUuid() { return this.uuid; }

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
