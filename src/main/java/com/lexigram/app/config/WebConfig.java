package com.lexigram.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${lexigram.upload.dir}")
  private String uploadDir;

  @Value("${lexigram.images-path}")
  private String imagesPath;

  /**
   *
   * Mapea http://localhost:8080/images/... a
   *
   * C:/Users/julir/Desktop/uploads/images/profile-pictures/...
   *
   */

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler(imagesPath + "**")
        .addResourceLocations("file:" + uploadDir);
  }

}