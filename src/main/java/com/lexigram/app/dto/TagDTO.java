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

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof TagDTO)) return false;
    TagDTO other = (TagDTO) o;
    return uuid != null && uuid.equals(other.getUuid());
  }

  @Override
  public int hashCode() {
    return uuid != null ? uuid.hashCode() : 0;
  }

}
