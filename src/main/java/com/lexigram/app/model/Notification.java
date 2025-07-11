package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import com.lexigram.app.types.NotificationType;
import jakarta.persistence.*;
import org.springframework.lang.Nullable;

import java.util.UUID;

@Entity
public class Notification {

  @PrePersist
  protected void onCreate() {
    this.uuid = UUID.randomUUID();
    this.creationDate = System.currentTimeMillis();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column
  private String title;

  @Column(nullable = false, unique = true, updatable = false)
  private UUID uuid;

  @Column
  private String text; //Like, new follower, comment, mention en experience

  @Column(nullable = false)
  private long creationDate;

  @Column
  private boolean read;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "recipient_id")
  private User recipient;

  @Nullable
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "actor_id")
  private User actor;

  @Nullable
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "experience_id")
  private Experience experience;

  @Nullable
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "suggestion_id")
  private Suggestion suggestion;

  @Enumerated(EnumType.STRING)
  private NotificationType type; // like, comment, mention to manage in sort by like comment mention

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "follow_request_id")
  private FollowRequest followRequest;


  public UUID getUuid() {
    return uuid;
  }

  public String getTitle() {
    return title;
  }

  public String getText() {
    return text;
  }

  public boolean isRead() {
    return read;
  }

  public long getCreationDate() {
    return creationDate;
  }

  @Nullable
  public User getActor() {
    return actor;
  }

  @Nullable
  public Experience getExperience() {
    return experience;
  }

  @Nullable
  public Suggestion getSuggestion(){
    return suggestion;
  }

  public NotificationType getType() {
    return type;
  }

  public void setRead(boolean read) {
    this.read = read;
  }

  public void setRecipient(User recipient) {
    this.recipient = recipient;
  }

  public void setActor(User actor) {
    this.actor = actor;
  }

  public void setExperience(Experience experience) {
    this.experience = experience;
  }

  public void setSuggestion(Suggestion suggestion) {
    this.suggestion = suggestion;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public void setText(String text) {
    this.text = text;
  }

  public void setType(NotificationType type) {
    this.type = type;
  }

  public FollowRequest getFollowRequest() {
    return followRequest;
  }

  public void setFollowRequest(FollowRequest followRequest) {
    this.followRequest = followRequest;
  }

}
