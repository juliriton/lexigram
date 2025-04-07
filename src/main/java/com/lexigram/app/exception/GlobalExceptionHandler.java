package com.lexigram.app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(UsernameAlreadyUsedException.class)
  public ResponseEntity<String> handleUsernameExists(UsernameAlreadyUsedException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
  }

  @ExceptionHandler(EmailAlreadyUsedException.class)
  public ResponseEntity<String> handleEmailExists(UsernameAlreadyUsedException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
  }

  @ExceptionHandler(UserNotFoundException.class)
  public ResponseEntity<String> handleUserNotFound(UserNotFoundException e) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
  }

  @ExceptionHandler(WrongPasswordException.class)
  public ResponseEntity<String> handleWrongPassword(WrongPasswordException e) {
    return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
  }

}