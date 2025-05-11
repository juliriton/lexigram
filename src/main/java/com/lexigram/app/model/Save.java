package com.lexigram.app.model;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

@Entity(name = "saves")
public class Save {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "experience_id", nullable = true)
  private Experience experience;

  @ManyToOne
  @JoinColumn(name = "suggestion_id", nullable = true)
  private Suggestion suggestion;

  public Save(){}

  public Save(User user, Experience experience) {
    this.user = user;
    this.experience = experience;
  }
  public Save(User user, Suggestion suggestion) {
    this.user = user;
    this.suggestion = suggestion;
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

  public Suggestion getSuggestion() {
    return suggestion;
  }

}
