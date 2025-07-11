# Multi-stage build
FROM openjdk:17-jdk-slim AS builder

# Set working directory
WORKDIR /app

# Copy gradle files
COPY build.gradle.kts settings.gradle.kts gradlew ./
COPY gradle gradle/

# Copy source code
COPY src src/

# Build the application
RUN ./gradlew build -x test

# Runtime stage
FROM openjdk:17-jdk-slim

# Create app directory
WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=render"]