# Development Dockerfile - builds locally and runs with hot reload
FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Install Maven (for hot reload capabilities)
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy Maven files
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Expose port 8080
EXPOSE 8080

# Run with Spring Boot Dev Tools for hot reload
CMD ["./mvnw", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dspring.profiles.active=dev"]