package com.lexigram.app.model.experience;

import com.lexigram.app.model.Comment;
import com.lexigram.app.model.Save;
import com.lexigram.app.model.Tag;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

import java.util.*;

@Entity(name = "experiences")
public class Experience {

  @PrePersist
  protected void onCreate() {
    this.creationDate = System.currentTimeMillis();
    this.uuid = UUID.randomUUID();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, updatable = false)
  private UUID uuid;

  @Column(nullable = false, columnDefinition = "Text")
  private String quote;

  @Column(nullable = false, columnDefinition = "Text")
  private String reflection;

  @Column(nullable = false)
  private long creationDate;

  @Column(nullable = false)
  private long resonatesAmount;

  @Column(nullable = false)
  private long commentAmount;

  @Column(nullable = false)
  private long saveAmount;

  @Column(nullable = false)
  private long branchAmount;

  @Column(nullable = false)
  private boolean isOrigin;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Resonate> resonates = new HashSet<>();

  @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Save> saves = new HashSet<>();

  @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Comment> comments = new HashSet<>();

  @ManyToMany
  @JoinTable(
      name = "experience_tag",
      joinColumns = @JoinColumn(name = "experience_id"),
      inverseJoinColumns = @JoinColumn(name = "tag_id")
  )
  private Set<Tag> tags = new HashSet<>();

  @ManyToOne
  @JoinColumn(name = "origin_id", referencedColumnName = "id", nullable = true)
  private Experience origin;

  @OneToMany(mappedBy = "origin", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Experience> branches;
  
  @OneToOne(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
  @JoinColumn(name = "style_id", referencedColumnName = "id")
  private ExperienceStyle style;

  @OneToOne(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
  private ExperiencePrivacySettings privacySettings;

  @ManyToMany
  @JoinTable(
      name = "experience_mentions",
      joinColumns = @JoinColumn(name = "experience_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id")
  )
  private Set<User> mentions;

  public Experience() {
    this.uuid = UUID.randomUUID();
    this.mentions = new HashSet<>();
  }

  public Experience(User user,
                     Set<User> mentions,
                     Set<Tag> tags,
                     String quote,
                     String reflection,
                     Boolean isOrigin
                     ){
    this.user = user;
    this.mentions = mentions;
    this.tags = tags;
    this.quote = quote;
    this.reflection = reflection;
    this.isOrigin = isOrigin;
  }

  public Long getId(){
    return id;
  }

  public UUID getUuid() {
    return uuid;
  }

  public String getQuote() {
    return quote;
  }

  public String getReflection() {
    return reflection;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public long getResonatesAmount() {
    return resonatesAmount;
  }

  public long getCommentAmount() {
    return commentAmount;
  }

  public long getSaveAmount() {
    return saveAmount;
  }

  public long getBranchAmount() {
    return branchAmount;
  }

  public boolean isOrigin() {
    return isOrigin;
  }

  public User getUser() {
    return user;
  }

  public Set<Resonate> getResonates(){
    return resonates;
  }

  public Set<Comment> getComments() {
    return comments;
  }

  public Set<Tag> getTags() {
    return tags;
  }

  public List<Experience> getBranches() {
    return branches;
  }

  public ExperienceStyle getStyle() {
    return style;
  }

  public ExperiencePrivacySettings getPrivacySettings() {
    return privacySettings;
  }

  public Set<User> getMentions() {
    return mentions;
  }

  public void setStyle(ExperienceStyle style) {
    this.style = style;
  }

  public void setPrivacySettings(ExperiencePrivacySettings privacySettings) {
    this.privacySettings = privacySettings;
  }

  public void setIsOrigin(Boolean isOrigin) {
    this.isOrigin = isOrigin;
  }

  public void setOrigin(Experience origin) {
    this.origin = origin;
  }

  public void setQuote(String quote) {
    this.quote = quote;
  }

  public void setReflection(String reflection) {
    this.reflection = reflection;
  }

  public void setTags(Set<Tag> tags) {
    this.tags = tags;
  }

  public void setMentions(Set<User> mentions) {
    this.mentions = mentions != null ? mentions : new HashSet<>();
  }

  public void addResonate(Resonate resonate) {
    resonates.add(resonate);
    resonatesAmount +=1;
  }

  public void removeResonate() {

  }

  public void addSave(Save save) {
    saves.add(save);
    saveAmount +=1;
  }

  public void addBranch() {
    branchAmount +=1;
  }

  public void addComment(Comment comment) {
    comments.add(comment);
    commentAmount +=1;
  }

  public Set<Save> getSaves() {
    return saves;
  }

}
