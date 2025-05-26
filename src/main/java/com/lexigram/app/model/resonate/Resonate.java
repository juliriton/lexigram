package com.lexigram.app.model.resonate;

import com.lexigram.app.model.Comment;
import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.suggestion.Suggestion;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

import java.util.UUID;

@Entity(name = "resonates")
public class Resonate {

  @PrePersist
  protected void onCreate() {
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
  @JoinColumn(name = "experience_id", nullable = true)
  private Experience experience;

  @ManyToOne
  @JoinColumn(name = "suggestion_id", nullable = true)
  private Suggestion suggestion;

  @ManyToOne
  @JoinColumn(name = "comment_id", nullable = true)
  private Comment comment;

  public Resonate() {}

  public Resonate(User user, Suggestion suggestion) {
    this.user = user;
    this.suggestion = suggestion;
  }

  public Resonate(User user, Experience experience) {
    this.user = user;
    this.experience = experience;
  }

  public Resonate(User user, Comment comment) {
    this.user = user;
    this.comment = comment;
  }

  public void setExperience(Experience experience) {
    this.experience = experience;
  }

  public void setSuggestion(Suggestion suggestion) {
    this.suggestion = suggestion;
  }

  public User getUser() {
    return user;
  }

  public Experience getExperience() {
    return experience;
  }

  public Suggestion getSuggestion() {
    return suggestion;
  }

  public Comment getComment() {
    return comment;
  }

  public UUID getUuid() {
    return uuid;
  }

}
