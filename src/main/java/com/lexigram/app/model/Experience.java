package com.lexigram.app.model;

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
  private long resonatesAmount = 0;

  @Column(nullable = false)
  private long commentAmount = 0;

  @Column(nullable = false)
  private long saveAmount = 0;

  @Column(nullable = false)
  private long branchAmount = 0;

  @Column(nullable = false)
  private boolean isOrigin = true;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

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
  private List<Experience> forks = new ArrayList<>();
  
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
  private Set<User> mentions = new HashSet<>();

  public Experience() {}

  public Experience(User user,
                     Set<User> mentions,
                     Set<Tag> tags,
                     String quote,
                     String reflection
                     ){
    this.user = user;
    this.mentions = mentions;
    this.tags = tags;
    this.quote = quote;
    this.reflection = reflection;
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

  public Set<Comment> getComments() {
    return comments;
  }

  public Set<Tag> getTags() {
    return tags;
  }

  public List<Experience> getForks() {
    return forks;
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
    this.mentions = mentions;
  }
}
