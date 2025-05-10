package com.lexigram.app.model.resonate;

import com.lexigram.app.model.experience.Experience;
import com.lexigram.app.model.Suggestion;
import com.lexigram.app.model.user.User;
import jakarta.persistence.*;

@Entity
public class Resonate {

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
  @JoinColumn(name = "suggestion_id", nullable = false)
  private Suggestion suggestion;

  public Resonate() {}

  public Resonate(User user) {
    this.user = user;
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

}
