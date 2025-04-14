package com.lexigram.app.dto;

public class TagDTO {

  private String name;
  private boolean isInFeed;

  public TagDTO(String name, boolean isInFeed) {
    this.name = name;
    this.isInFeed = isInFeed;
  }

  public String getName() {
    return name;
  }

  public boolean isInFeed() {
    return isInFeed;
  }

}
