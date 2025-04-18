package com.lexigram.app.dto;

import com.lexigram.app.model.ExperienceStyle;

public class ExperienceStyleDTO {

  private String fontFamily;
  private int fontSize;
  private String fontColor;
  private int textPositionX;
  private int textPositionY;
  private String backgroundMediaUrl;

  public ExperienceStyleDTO() {}

  public ExperienceStyleDTO(ExperienceStyle style) {
    this.fontFamily = style.getFontFamily();
    this.fontSize = style.getFontSize();
    this.fontColor = style.getFontColor();
    this.textPositionX = style.getTextPositionX();
    this.textPositionY = style.getTextPositionY();
    this.backgroundMediaUrl = style.getBackgroundMediaUrl();
  }

  public String getFontFamily(){
    return fontFamily;
  }

  public int getFontSize(){
    return fontSize;
  }

  public String getFontColor(){
    return fontColor;
  }

  public int getTextPositionX(){
    return textPositionX;
  }

  public int getTextPositionY(){
    return textPositionY;
  }

  public String getBackgroundMediaUrl(){
    return backgroundMediaUrl;
  }

}
