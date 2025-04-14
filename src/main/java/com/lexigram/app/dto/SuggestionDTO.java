package com.lexigram.app.dto;

import com.lexigram.app.model.Suggestion;

public class SuggestionDTO {

  private Suggestion suggestion;

  public SuggestionDTO(Suggestion suggestion) {
    this.suggestion = suggestion;
  }

  public Suggestion getSuggestion() {
    return suggestion;
  }
}
