package com.lexigram.app.dto;

public class UserProfileDTO {
  private String biography;
  private String profilePictureUrl;

  public UserProfileDTO() {}

  public UserProfileDTO(String biography, String profilePictureUrl) {
    this.biography = biography;
    this.profilePictureUrl = profilePictureUrl;
  }

  public String getBiography() {
    return biography;
  }

  public String getProfilePictureUrl() {
    return profilePictureUrl;
  }
}
