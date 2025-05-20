package com.lexigram.app.model.suggestion;

import com.lexigram.app.model.Save;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.experience.ExperiencePrivacySettings;
import com.lexigram.app.model.resonate.Resonate;
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

  @OneToMany(mappedBy = "suggestion", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
  private Set<Experience> replies = new HashSet<>();

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

  @OneToOne(mappedBy = "suggestion", cascade = CascadeType.ALL, orphanRemoval = true)
  private SuggestionPrivacySettings privacySettings;

  public Suggestion() {}

  public Suggestion(User user,
                    Set<Tag> tags,
                    String body) {
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

  public void removeReply(Experience experience) {
    replies.remove(experience);
    replyAmount-=1;
  }

  public Set<Save> getSaves(){
    return saves;
  }

  public void addSave(Save save) {
    saves.add(save);
    saveAmount += 1;
  }

  public void removeSave(Save save) {
    saves.remove(save);
    saveAmount-=1;
  }

  public void addResonate(Resonate resonate) {
    resonates.add(resonate);
    resonateAmount+=1;
  }

  public void removeResonate(Resonate resonate) {
    resonates.remove(resonate);
    resonateAmount-=1;
  }

  public void setTags(Set<Tag> tags) {
    this.tags = tags;
  }

  public Set<Resonate> getResonates() {
    return resonates;
  }

  public long getSavesAmount() {
    return saveAmount;
  }

  public SuggestionPrivacySettings getPrivacySettings() {
    return privacySettings;
  }

  public void setPrivacySettings(SuggestionPrivacySettings privacySettings) {
    this.privacySettings = privacySettings;
  }

}
