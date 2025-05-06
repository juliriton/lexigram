package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public class UpdateExperienceQuoteDTO {

  private UUID uuid;

  @NotBlank(message = "Quote cannot be null or empty")
  private String quote;

  public UpdateExperienceQuoteDTO() {
  }

  public UpdateExperienceQuoteDTO(UUID uuid, String quote) {
    this.uuid = uuid;
    this.quote = quote;
  }

  public UUID getUuid() {
    return uuid;
  }

  public void setUuid(UUID uuid) {
    this.uuid = uuid;
  }

  public String getQuote() {
    return quote;
  }

  public void setQuote(String quote) {
    this.quote = quote;
  }
}