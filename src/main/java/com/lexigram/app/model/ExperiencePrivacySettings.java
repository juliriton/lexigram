package com.lexigram.app.model;

import jakarta.persistence.*;

@Entity(name = "experience_privacy_settings")
public class ExperiencePrivacySettings {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "experience_id", nullable = false)
  private Experience experience;

  @Column(nullable = false)
  private boolean allowComments = true;

  @Column(nullable = false)
  private boolean allowForks = true;

  @Column(nullable = false)
  private boolean allowResonates = true;

  public ExperiencePrivacySettings() {}

  public ExperiencePrivacySettings(Experience experience,
                                   Boolean allowComments,
                                   Boolean allowForks,
                                   Boolean allowResonates) {
    this.experience = experience;
    this.allowComments = allowComments;
    this.allowForks = allowForks;
    this.allowResonates = allowResonates;
  }

}
