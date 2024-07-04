# Utiliser une image de base pour Maven
FROM maven:3.6.3-jdk-11 AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier pom.xml et télécharger les dépendances
COPY pom.xml .
RUN mvn dependency:go-offline

# Copier le reste des fichiers du projet et compiler
COPY src ./src
RUN mvn package

# Utiliser une image de base pour Java
FROM openjdk:11-jre-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier le fichier JAR depuis l'étape de build
COPY --from=build /app/target/facturx-service-1.0-SNAPSHOT.jar facturx-service.jar

# Exposer le port de l'application
EXPOSE 8080

# Démarrer l'application
ENTRYPOINT ["java", "-jar", "facturx-service.jar"]
