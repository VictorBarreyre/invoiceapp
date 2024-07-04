# Utiliser une image de base pour Node.js
FROM node:16

# Créer un répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application
COPY . .

# Exposer le port de l'application
EXPOSE 8000

# Démarrer l'application
CMD ["node", "server.js"]
