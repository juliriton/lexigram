package com.lexigram.app.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class UserUpdateProfileDTO {

  @Size(max = 500, message = "La biografía no puede tener más de 500 caracteres.")
  private String biography;

  @Pattern(
      regexp = "^(https?|ftp)://[^\\s/$.?#].[^\\s]*$",
      message = "La URL de la foto de perfil no es válida."
  )
  private String profilePictureUrl;

  // Constructor vacío
  public UserUpdateProfileDTO() {}

  // Constructor con parámetros
  public UserUpdateProfileDTO(String biography, String profilePictureUrl) {
    this.biography = biography;
    this.profilePictureUrl = profilePictureUrl;
  }

  // Getters y Setters
  public String getBiography() {
    return biography;
  }

  public void setBiography(String biography) {
    this.biography = biography;
  }

  public String getProfilePictureUrl() {
    return profilePictureUrl;
  }

  public void setProfilePictureUrl(String profilePictureUrl) {
    this.profilePictureUrl = profilePictureUrl;
  }

  @Override
  public String toString() {
    return "UserUpdateProfileDTO{" +
        "biography='" + biography + '\'' +
        ", profilePictureUrl='" + profilePictureUrl + '\'' +
        '}';
  }
}
