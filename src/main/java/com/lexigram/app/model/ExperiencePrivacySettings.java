package com.lexigram.app.model;

import jakarta.persistence.*;

@Entity
public class ExperiencePrivacySettings {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "experience_id", nullable = false)
  private Experience experience;

  @Column(nullable = false)
  private boolean allowMentions = true;

  @Column(nullable = false)
  private boolean allowComments = true;

  @Column(nullable = false)
  private boolean allowForks = true;

  @Column(nullable = false)
  private boolean allowResonates = true;

}
