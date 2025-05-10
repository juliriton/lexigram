package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "comments")
public class Comment {

  @PrePersist
  protected void onCreate() {
    this.creationDate = System.currentTimeMillis();
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

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


}


