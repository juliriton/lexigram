package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.UserProfile;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity(name = "tags")
public class Tag {

  @PrePersist
  public void onCreate() {
    uuid = UUID.randomUUID();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private UUID uuid;

  @Column(unique = true, nullable = false)
  private String name;

  @ManyToMany(mappedBy = "tags")
  private List<Suggestion> suggestions = new ArrayList<>();

  @ManyToMany(mappedBy = "tags")
  private List<Experience> experiences = new ArrayList<>();

  @ManyToMany(mappedBy = "feedTags")
  private List<UserProfile> userProfiles = new ArrayList<>();

  @Transient
  private boolean isInFeed; // Transient field to track if tag is in user's feed

  public Tag(){}

  public Tag(String name){
    this.name = name;
  }

  public String getName(){
    return name;
  }

  public boolean isInFeed() {
    return isInFeed;
  }

  public void setInFeed(boolean inFeed) {
    isInFeed = inFeed;
  }

  public UUID getUuid() {
    return uuid;
  }

}
