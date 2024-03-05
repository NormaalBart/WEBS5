# Gebruik een NodeJS-image met een vaste versie
FROM node:20

# Zet de werkdirectory naar /app
WORKDIR /app

# Kopieer de code naar de werkdirectory
COPY . .

# Voer npm install uit
RUN npm install

EXPOSE 5672

# Gebruik npm start als startcommando
CMD node receiver.js