# syntax=docker/dockerfile:1

FROM node:20-alpine
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
COPY . .

# Node specifics
RUN npm install
RUN npm run build

# Remove source files and dev node modules
RUN rm -rf src
RUN rm tsconfig.json
RUN rm jest.config.js

# Tell docker about port
EXPOSE 3201

# Serve
CMD [ "npm", "run", "serve" ]