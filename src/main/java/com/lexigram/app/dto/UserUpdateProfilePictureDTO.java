package com.lexigram.app.dto;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public class UserUpdateProfilePictureDTO {

  @NotNull
  private MultipartFile file;

  public UserUpdateProfilePictureDTO() {}

  public UserUpdateProfilePictureDTO(MultipartFile file) {
    this.file = file;
  }

  public MultipartFile getFile() {
    return file;
  }
}
