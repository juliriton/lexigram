package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class UpdateExperienceQuoteDTO {

  private UUID uuid;

  @NotBlank(message = "Quote cannot be null or empty")
  @Size(min = 100, max = 800, message = "Reflection must be between 100 and 800 characters. Share something meaningful!")
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