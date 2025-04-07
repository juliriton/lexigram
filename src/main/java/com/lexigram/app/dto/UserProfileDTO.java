package com.lexigram.app.dto;

public class UserProfileDTO {

  private String username;
  private String biography;
  private String profilePictureUrl;

  public UserProfileDTO() {}

  public UserProfileDTO(String username, String biography, String profilePictureUrl) {
    this.username = username;
    this.biography = biography;
    this.profilePictureUrl = profilePictureUrl;
  }

  public String getUsername() { return username; }

  public String getBiography() {
    return biography;
  }

  public String getProfilePictureUrl() {
    return profilePictureUrl;
  }
}
