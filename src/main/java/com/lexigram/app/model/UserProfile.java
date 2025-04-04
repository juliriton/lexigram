package com.lexigram.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile{

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "profile_picture_url", length = 255)
  private String profilePictureUrl;

  @Column(columnDefinition = "Text")
  private String biography;

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

