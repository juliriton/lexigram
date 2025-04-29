package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.UUID;

public class UpdateExperienceQuoteDTO {
  @NotBlank
  @NotEmpty
  private UUID uuid;

  @NotBlank
  @NotEmpty
  private String quote;

  UpdateExperienceQuoteDTO(UUID uuid, String quote) {
    this.uuid = uuid;
    this.quote = quote;
  }

  public UUID getUuid() {
    return uuid;
  }

  public String getQuote() {
    return quote;
  }
}
