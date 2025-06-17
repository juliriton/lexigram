package com.lexigram.app.model.user;

import com.lexigram.app.model.Tag;
import jakarta.persistence.*;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

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

  @ManyToMany
  @JoinTable(
      name = "user_profile_feed_tags",
      joinColumns = @JoinColumn(name = "user_profile_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id")
  )
  private Set<Tag> feedTags = new HashSet<>();

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

  public Set<Tag> getFeedTags() {
    return feedTags;
  }

  public void addTagToFeed(Tag tag) {
    this.feedTags.add(tag);
  }

  public void removeTagFromFeed(Tag tag) {
    this.feedTags.remove(tag);
  }

}

