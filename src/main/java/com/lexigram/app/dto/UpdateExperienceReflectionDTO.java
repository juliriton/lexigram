package com.lexigram.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class UpdateExperienceReflectionDTO {

  private UUID uuid;

  @Size(min = 10, max = 300, message = "Reflection must be between 10 and 300 characters. Share something meaningful!")
  private String reflection;

  public UpdateExperienceReflectionDTO() {
  }

  UpdateExperienceReflectionDTO(UUID uuid, String reflection) {
    this.uuid = uuid;
    this.reflection = reflection;
  }

  public UUID getUuid() {
    return uuid;
  }

  public String getReflection() {
    return reflection;
  }

  public void setUuid(UUID uuid) {
    this.uuid = uuid;
  }

  public void setReflection(String reflection) {
    this.reflection = reflection;
  }
}
