package com.lexigram.app.dto;

import java.util.UUID;

public class UserDTO {
  private Long id;
  private UUID uuid;
  private String username;
  private String email;

  public UserDTO() {}

  public UserDTO(Long id, UUID uuid, String username, String email) {
    this.id = id;
    this.uuid = uuid;
    this.username = username;
    this.email = email;
  }

  public Long getId() { return this.id; }

  public UUID getUuid() { return this.uuid; }

  public String getUsername() {
    return this.username;
  }

  public String getEmail() {
    return this.email;
  }

}
