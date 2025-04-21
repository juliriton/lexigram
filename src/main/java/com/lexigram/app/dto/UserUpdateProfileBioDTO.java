package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserUpdateProfileBioDTO {

  @NotNull(message = "Biography can't be blank")
  @Size(max = 150, message = "Biography can't be longer than 500 characters.")
  private String biography;

  public UserUpdateProfileBioDTO() {}

  public UserUpdateProfileBioDTO(String biography) {
    this.biography = biography;
  }

  public String getBiography() {
    return biography;
  }

  public void setBiography(String biography) {
    this.biography = biography;
  }

}
