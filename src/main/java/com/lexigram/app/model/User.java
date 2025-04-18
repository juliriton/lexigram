package com.lexigram.app.model;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private UserPrivacySettings userPrivacySettings;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private UserProfile userProfile;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private Set<Experience> experiences = new HashSet<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private Set<Suggestion> suggestions = new HashSet<>();

  @ManyToMany(mappedBy = "mentions")
  private Set<Experience> mentionedIn = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "user_following",
      joinColumns = @JoinColumn(name = "follower_id"),
      inverseJoinColumns = @JoinColumn(name = "following_id")
  )
  private Set<User> following = new HashSet<>();

  @ManyToMany(mappedBy = "following")
  private Set<User> followers = new HashSet<>();

  public Long getId() {
    return id;
  }

  public String getUsername() {
    return this.username;
  }

  public String getPassword() {return this.password; }

  public String getEmail() {
    return email;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public UserPrivacySettings getUserPrivacySettings() {
    return userPrivacySettings;
  }

  public Set<Experience> getMentionedIn() {
    return mentionedIn;
  }

  public Set<Experience> getExperiences() {
    return experiences;
  }

  public Set<Suggestion> getSuggestions() {
    return suggestions;
  }

  public Set<User> getFollowers() {
    return followers;
  }

  public Set<User> getFollowing() {
    return following;
  }

  public void addFollower(User user) {
    followers.add(user);
  }

  public void addFollowing(User user) {
    following.add(user);
  }

  public void removeFollowing(User user) {
    following.remove(user);
  }

  public void removeFollower(User user) {
    followers.remove(user);
  }

}