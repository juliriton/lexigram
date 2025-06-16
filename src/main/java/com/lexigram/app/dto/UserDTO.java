package com.lexigram.app.dto;

import com.lexigram.app.model.user.User;
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

  // Constructor que recibe un objeto User
  public UserDTO(User user) {
    this.id = user.getId();
    this.uuid = user.getUuid();
    this.username = user.getUsername();
    this.email = user.getEmail();
  }

  public Long getId() {
    return this.id;
  }

  public UUID getUuid() {
    return this.uuid;
  }

  public String getUsername() {
    return this.username;
  }

  public String getEmail() {
    return this.email;
  }
}