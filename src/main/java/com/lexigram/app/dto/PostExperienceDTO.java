package com.lexigram.app.dto;

import com.lexigram.app.model.Tag;
import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public class PostExperienceDTO {

  @NotBlank
  private String quote;

  @NotBlank
  @Size(min = 200, max = 800, message = "Reflection must be between 200 and 800 characters. Share something meaningful!")
  private String reflection;

  @NotNull
  @Size(min = 1, message = "Experiences should have at least 1 tag.")
  private Set<Tag> tags;

  private Set<String> mentions;

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

  private boolean allowComments;
  private boolean allowForks;
  private boolean allowResonates;

  public PostExperienceDTO(String quote,
                           String experience,
                           Set<Tag> tags,
                           Set<String> mentions,
                           String fontFamily,
                           int fontSize,
                           String fontColor,
                           int textPositionX,
                           int textPositionY,
                           MultipartFile file,
                           boolean allowComments,
                           boolean allowResonates,
                           boolean allowForks) {
    this.quote = quote;
    this.reflection = experience;
    this.tags = tags;
    this.mentions = mentions;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.textPositionX = textPositionX;
    this.textPositionY = textPositionY;
    this.file = file;
    this.allowComments = allowComments;
    this.allowResonates = allowResonates;
    this.allowForks = allowForks;
  }

  public String getQuote() {
    return quote;
  }

  public String getReflection() {
    return reflection;
  }

  public Set<Tag> getTags() {
    return tags;
  }

  public Set<String> getMentions() {
    return mentions;
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

  public boolean areCommentsAllowed() {
    return allowComments;
  }

  public boolean areResonatesAllowed() {
    return allowResonates;
  }

  public boolean areForksAllowed() {
    return allowForks;
  }

}

