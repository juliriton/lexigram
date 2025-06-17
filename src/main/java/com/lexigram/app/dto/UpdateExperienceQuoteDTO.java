package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class UpdateExperienceQuoteDTO {

  private UUID uuid;

  @NotEmpty
  @NotBlank
  @Size(min = 10, max = 300, message = "Quote must be between 10 and 300 characters. Share something meaningful!")
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