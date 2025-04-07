package com.lexigram.app.dto;

import org.springframework.web.multipart.MultipartFile;

public class UserUpdateProfilePictureDTO {

  private MultipartFile file;

  public UserUpdateProfilePictureDTO() {}

  public UserUpdateProfilePictureDTO(MultipartFile file) {
    this.file = file;
  }

  public MultipartFile getFile() {
    return file;
  }
}
