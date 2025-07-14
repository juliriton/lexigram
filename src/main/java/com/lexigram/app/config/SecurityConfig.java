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
                "/api/experience/**",  // Allow public access to experience endpoints
                "/api/suggestion/**",  // Allow public access to suggestion endpoints
                "/api/experience/*/comments/**",
                "/api/experience/*/comments",
                "/api/suggestion/*/comments/**",
                "/api/suggestion/*/comments",
                "/images/**"
            ).permitAll()
            .anyRequest().authenticated()
        )
        .oauth2Login(oauth2 -> oauth2
            .defaultSuccessUrl("/api/auth/oauth2/login/success", true)
        )
        .formLogin(form -> form.disable())
        .httpBasic(httpBasic -> httpBasic.disable());
    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    // Be more specific with allowed origins in production
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "https://localhost:3000",
        "https://lexigram-ydhn.onrender.com",
        frontendUrl
    ));

    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}