# Giai đoạn 1: Build ứng dụng Spring Boot
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Sao chép file cấu hình Maven
COPY pom.xml .

# Tải các thư viện cần thiết
RUN mvn dependency:go-offline

# Sao chép source code
COPY src ./src

# Build ứng dụng thành file JAR
RUN mvn clean package -DskipTests

# Giai đoạn 2: Chạy ứng dụng
FROM eclipse-temurin:21-jre

WORKDIR /app

# Sao chép file JAR từ giai đoạn build
COPY --from=build /app/target/*.jar app.jar

# Chạy ứng dụng bằng cổng Render cung cấp
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]