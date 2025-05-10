package com.lexigram.app.model.user;

import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "profile_picture_url")
  private String profilePictureUrl;

  @Column(columnDefinition = "Text")
  private String biography;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  public UserProfile() {
  }

  public UserProfile(User user) {
    this.user = user;
  }

  public Long getId() {
    return id;
  }

  public String getProfilePictureUrl() {
    return profilePictureUrl;
  }

  public void setProfilePictureUrl(String profilePictureUrl) {
    this.profilePictureUrl = profilePictureUrl;
  }

  public String getBiography() {
    return biography;
  }

  public void setBiography(String biography) {
    this.biography = biography;
  }

}

