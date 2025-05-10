package com.lexigram.app.model;

import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity(name = "suggestions")
public class Suggestion {

  @PrePersist
  protected void onCreate() {
    this.creationDate = System.currentTimeMillis();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, updatable = false)
  private UUID uuid = UUID.randomUUID();

  @Column(nullable = false, columnDefinition = "Text")
  private String header = "Tell me about";

  @Column(nullable = false, columnDefinition = "Text", updatable = false)
  private String body;

  @Column(nullable = false)
  private long resonateAmount = 0;

  @Column(nullable = false)
  private long experienceAmount = 0;

  @Column(nullable = false)
  private long creationDate;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToMany
  @JoinTable(
      name = "suggestion_tag",
      joinColumns = @JoinColumn(name = "suggestion_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id")
  )
  private Set<Tag> tags = new HashSet<>();

  public Suggestion() {}

  public Suggestion(User user, Set<Tag> tags, String body) {
    this.user = user;
    this.tags = tags;
    this.body = body;
  }

  public Long getId() {
    return id;
  }

  public UUID getUuid() {
    return uuid;
  }

  public String getHeader() {
    return header;
  }

  public long getResonatesAmount() {
    return resonateAmount;
  }

  public long getExperienceAmount() {
    return experienceAmount;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public User getUser() {
    return user;
  }

  public Set<Tag> getTags() {
    return tags;
  }

  public String getBody(){
    return body;
  }

}
