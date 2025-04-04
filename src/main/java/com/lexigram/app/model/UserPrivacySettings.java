package com.lexigram.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_privacy_settings")
public class UserPrivacySettings {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "visibility", nullable = false)
  private boolean visibility = true;

  @OneToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  protected UserPrivacySettings() {}

  public UserPrivacySettings(User user) { this.user = user; }

  public Long getId(){
    return this.id;
  }

  public void switchVisibility(){ this.visibility = !this.visibility; }

  public User getUser() { return this.user; }

  public boolean isPublic(){ return this.visibility; }
}
