package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

  @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL)
  private List<Comment> replies = new ArrayList<>();

  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(nullable = false)
  private long creationDate;

  @Column(nullable = false)
  private long resonatesCount = 0;

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

  public long getResonatesCount() {
    return resonatesCount;
  }

  public List<Comment> getReplies() {
    return replies;
  }


}


