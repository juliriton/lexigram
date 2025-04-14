package com.lexigram.app.model;

import jakarta.persistence.*;

@Entity(name = "experience_styles")
public class ExperienceStyle {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne
  @JoinColumn(name = "experience_id", nullable = false)
  private Experience experience;

  @Column(name = "font_family")
  private String fontFamily;

  @Column(name = "font_size")
  private int fontSize;

  @Column(name = "font_color")
  private String fontColor;

  @Column(name = "text_position_x")
  private int textPositionX;

  @Column(name = "text_position_y")
  private int textPositionY;

  @Column(name = "background_media_url")
  private String backgroundMediaUrl;

}


