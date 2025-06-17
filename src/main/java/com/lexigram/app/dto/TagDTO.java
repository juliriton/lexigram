package com.lexigram.app.dto;

import java.util.UUID;

public class TagDTO {

  private UUID uuid;
  private String name;

  public TagDTO() {}

  public TagDTO(UUID uuid, String name) {
    this.uuid = uuid;
    this.name = name;
  }

  public String getName() {
    return name;
  }

  public UUID getUuid() {
    return uuid;
  }

}
