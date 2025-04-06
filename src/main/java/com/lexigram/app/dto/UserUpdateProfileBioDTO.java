package com.lexigram.app.dto;

import jakarta.validation.constraints.Size;

public class UserUpdateProfileBioDTO {

  @Size(max = 150, message = "La biografía no puede tener más de 500 caracteres.")
  private String biography;

    public String getBiography() {
      return biography;
    }

    public void setBiography(String biography) {
      this.biography = biography;
    }

}
