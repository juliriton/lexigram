package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.resonate.Resonate;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

import java.util.*;

@Entity(name = "comments")
public class Comment {

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

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "experience_id", nullable = false)
  private Experience experience;

  @ManyToOne
  @JoinColumn(name = "parent_comment_id", nullable = false)
  private Comment parentComment;

  @OneToMany(mappedBy = "parentComment", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Comment> replies = new ArrayList<>();

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(nullable = false)
  private long creationDate;

  @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<Resonate> resonates = new HashSet<>();

  @Column(nullable = false)
  private long resonatesAmount;

  @Column(nullable = false)
  private long repliesAmount;

  public Comment(){}

  public Comment(User user, Experience experience, String content) {
    this.user = user;
    this.experience = experience;
    this.content = content;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public Experience getExperience() {
    return experience;
  }

  public Comment getParentComment() {
    return parentComment;
  }

  public void setParentComment(Comment parentComment) {
    this.parentComment = parentComment;
  }

  public String getContent() {
    return content;
  }

  public long getCreationDate() {
    return creationDate;
  }

  public long getResonatesAmount() {
    return resonatesAmount;
  }

  public List<Comment> getReplies() {
    return replies;
  }

  public UUID getUuid() {
    return uuid;
  }

  public UUID getExpUuid() {
    return experience.getUuid();
  }

  public Set<Resonate> getResonates() {
    return resonates;
  }

  public void addResonate(Resonate resonate) {
    this.resonates.add(resonate);
    resonatesAmount+=1;
  }

  public void removeResonate(Resonate resonate) {
    resonates.remove(resonate);
    resonatesAmount-=1;
  }

  public void addReply(Comment comment) {
    replies.add(comment);
    repliesAmount+=1;
  }

  public void removeReply(Comment comment) {
    replies.remove(comment);
    repliesAmount-=1;
  }

}


