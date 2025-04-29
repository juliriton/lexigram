package com.lexigram.app.dto;

public class ConnectionProfileDTO {

  private String username;
  private String biography;
  private String profilePictureUrl;
  private boolean isFollowing;
  private Long followingAmount;
  private Long followerAmount;

  public ConnectionProfileDTO() {}

  public ConnectionProfileDTO(String username,
                              String biography,
                              String profilePictureUrl,
                              boolean isFollowing,
                              Long followingAmount,
                              Long followerAmount) {
    this.username = username;
    this.biography = biography;
    this.profilePictureUrl = profilePictureUrl;
    this.isFollowing = isFollowing;
    this.followingAmount = followingAmount;
    this.followerAmount = followerAmount;
  }

  public String getUsername() {
    return username;
  }

  public String getBiography() {
    return biography;
  }

  public String getProfilePictureUrl() {
    return profilePictureUrl;
  }

  public boolean getIsFollowing() {
    return isFollowing;
  }

  public Long getFollowingAmount() {
    return followingAmount;
  }

  public Long getFollowerAmount() {
    return followerAmount;
  }

}
