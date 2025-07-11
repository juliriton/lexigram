package com.lexigram.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

  @Value("${lexigram.frontend.url:http://localhost:3000}")
  private String frontendUrl;

  @Value("${lexigram.base-url:http://localhost:8080}")
  private String baseUrl;

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(
                "/api/auth/**",
                "/oauth2/**",
                "/login/oauth2/**",
                "/api/auth/feed",
                "/api/auth/signup",
                "/api/auth/login",
                "/api/auth/me/**",
                "/api/experience/*/comments/**",
                "/api/experience/*/comments",
                "/images/**"
            ).permitAll()
            .anyRequest().authenticated()
        )
        .oauth2Login(oauth2 -> oauth2
            .defaultSuccessUrl(frontendUrl + "/login/success", true)
        )
        .formLogin(form -> form.disable())
        .httpBasic(httpBasic -> httpBasic.disable());
    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Create a list of allowed origins that includes both local and production URLs
    List<String> allowedOrigins = Arrays.asList(
        "http://localhost:3000",           // Local development frontend
        "http://localhost:8080",           // Local development backend
        frontendUrl,                       // Production frontend URL
        baseUrl                           // Production backend URL
    );

    configuration.setAllowedOriginPatterns(Arrays.asList("*")); // More permissive for debugging
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}