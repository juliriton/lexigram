package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.List;
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

  @ManyToOne
  @JoinColumn(name = "suggestion_id")
  private Suggestion suggestion;

  @OneToMany(mappedBy = "suggestion", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Experience> replies;

  @OneToMany(mappedBy = "suggestion", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Resonate> resonates = new HashSet<>();

  @OneToMany(mappedBy = "suggestion", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Save> saves = new HashSet<>();

  @Column(nullable = false)
  private long resonateAmount;

  @Column(nullable = false)
  private long saveAmount;

  @Column(nullable = false)
  private long replyAmount;

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

  public Set<Experience> getReplies() {
    return replies;
  }

  public long getResonatesAmount() {
    return resonateAmount;
  }

  public long getExperienceAmount() {
    return replyAmount;
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

  public void addReply(Experience experience) {
    replies.add(experience);
    replyAmount+=1;
  }

  public Set<Save> getSaves(){
    return saves;
  }

  public void addSave(Save save) {
    saves.add(save);
    saveAmount += 1;
  }

  public void addResonate(Resonate resonate) {
    resonates.add(resonate);
    resonateAmount+=1;
  }

}
