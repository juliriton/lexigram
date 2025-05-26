package com.lexigram.app.model.suggestion;

import com.lexigram.app.dto.PostSuggestionPrivacySettingsDTO;
import jakarta.persistence.*;

@Entity(name = "suggestion_privacy_settings")
public class SuggestionPrivacySettings {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "suggestion_id", nullable = false)
  private Suggestion suggestion;

  @Column(nullable = false)
  private boolean allowResonates = true;

  @Column(nullable = false)
  private boolean allowSaves = true;

  public SuggestionPrivacySettings() {}

  public SuggestionPrivacySettings(Suggestion suggestion,
                                   boolean allowResonates,
                                   boolean allowSaves) {
    this.suggestion = suggestion;
    this.allowResonates = allowResonates;
    this.allowSaves = allowSaves;
  }

  public boolean areResonatesAllowed(){
    return allowResonates;
  }

  public boolean areSavesAllowed() {
    return allowSaves;
  }

  public Suggestion getExperience() {
    return suggestion;
  }

}
