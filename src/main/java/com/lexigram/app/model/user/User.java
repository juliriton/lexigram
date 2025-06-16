package com.lexigram.app.model.user;

import com.lexigram.app.model.Comment;
import com.lexigram.app.model.Notification;
import com.lexigram.app.model.Save;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;
import jakarta.persistence.*;

import java.util.*;

@Entity
@Table(name = "users")
public class User {

  @PrePersist
  public void onCreate() {
    this.uuid = UUID.randomUUID();
    this.followerAmount = 0L;
    this.followingAmount = 0L;
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, updatable = false)
  private UUID uuid;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private UserPrivacySettings userPrivacySettings;

  @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private UserProfile userProfile;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private Set<Experience> experiences = new HashSet<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private Set<Suggestion> suggestions = new HashSet<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private Set<Comment> comments = new HashSet<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private Set<Resonate> resonates = new HashSet<>();

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Save> saves = new HashSet<>();

  @ManyToMany(mappedBy = "mentions", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
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

  @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Notification> receivedNotifications = new ArrayList<>();

  @OneToMany(mappedBy = "actor", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Notification> triggeredNotifications = new ArrayList<>();

  private Long followingAmount;

  private Long followerAmount;

  public User() {}

  public Long getId() {
    return id;
  }

  public UUID getUuid() {
    return uuid;
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

  public UserProfile getUserProfile() {
    return userProfile;
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
    followerAmount += 1;
  }

  public void addFollowing(User user) {
    following.add(user);
    followingAmount += 1;
  }

  public void removeFollowing(User user) {
    following.remove(user);
    followingAmount -= 1;
  }

  public void removeFollower(User user) {
    followers.remove(user);
    followerAmount -= 1;
  }

  public Long getFollowingAmount() {
    return followingAmount;
  }

  public Long getFollowerAmount() {
    return followerAmount;
  }

  public Set<Save> getSaves() {
    return saves;
  }

  public Set<Resonate> getResonates() {
    return resonates;
  }

}