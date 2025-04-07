package com.lexigram.app.exception;

public class WrongPasswordException extends RuntimeException {
  public WrongPasswordException() {
    super("Wrong password");
  }
}
