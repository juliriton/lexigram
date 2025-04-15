package com.lexigram.app.dto;

import com.lexigram.app.model.Tag;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

public class PostExperienceDTO {

  private String quote;
  private String reflection;
  private Set<Tag> tags;
  private Set<String> mentions;
  private String fontFamily;
  private int fontSize;
  private String fontColor;
  private int textPositionX;
  private int textPositionY;
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

