FROM openjdk:17-jdk-slim
COPY build/libs/lexigram-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar", "--spring.profiles.active=render"]