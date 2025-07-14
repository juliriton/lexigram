package com.lexigram.app.dto;

import java.util.UUID;

public class TagDTO {
  private UUID uuid;
  private String name;
  private boolean inFeed;

  public TagDTO() {}

  public TagDTO(UUID uuid, String name, boolean inFeed) {
    this.uuid = uuid;
    this.name = name;
    this.inFeed = inFeed;
  }

  public String getName() {
    return name;
  }

  public UUID getUuid() {
    return uuid;
  }

  public boolean isInFeed() {
    return inFeed;
  }

  public void setInFeed(boolean inFeed) {
    this.inFeed = inFeed;
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