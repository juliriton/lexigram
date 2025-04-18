package com.lexigram.app.dto;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

public class PostExperienceStyleDTO {

  @NotBlank
  private String fontFamily;

  @Min(8)
  @Max(48)
  private int fontSize;

  @Pattern(regexp = "^#[0-9a-fA-F]{6}$")
  private String fontColor;

  @Min(0)
  private int textPositionX;

  @Min(0)
  private int textPositionY;

  @NotNull
  private MultipartFile file;

  public PostExperienceStyleDTO() {}

  public PostExperienceStyleDTO(String fontFamily,
                                int fontSize,
                                String fontColor,
                                int textPositionX,
                                int textPositionY,
                                MultipartFile file) {

    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.textPositionX = textPositionX;
    this.textPositionY = textPositionY;
    this.file = file;
  }

  public String getFontFamily() {
    return fontFamily;
  }

  public int getFontSize() {
    return fontSize;
  }

  public String getFontColor() {
    return fontColor;
  }

  public int getTextPositionX() {
    return textPositionX;
  }

  public int getTextPositionY() {
    return textPositionY;
  }

  public MultipartFile getFile() {
    return file;
  }

}
