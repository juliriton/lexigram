package com.lexigram.app.model.experience;

import jakarta.persistence.*;

@Entity(name = "experience_styles")
public class ExperienceStyle {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "experience_id", nullable = false)
  private Experience experience;

  @Column(name = "font_family", nullable = false)
  private String fontFamily;

  @Column(name = "font_size", nullable = false)
  private int fontSize;

  @Column(name = "font_color", nullable = false)
  private String fontColor;

  @Column(name = "text_position_x", nullable = false)
  private int textPositionX;

  @Column(name = "text_position_y", nullable = false)
  private int textPositionY;

  @Column(name = "background_media_url", nullable = false)
  private String backgroundMediaUrl;

  public ExperienceStyle() {}

  public ExperienceStyle(Experience experience,
                         String fontFamily,
                         int fontSize,
                         String fontColor,
                         int textPositionX,
                         int textPositionY,
                         String backgroundMediaUrl) {
    this.experience = experience;
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.fontColor = fontColor;
    this.textPositionX = textPositionX;
    this.textPositionY = textPositionY;
    this.backgroundMediaUrl = backgroundMediaUrl;
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


