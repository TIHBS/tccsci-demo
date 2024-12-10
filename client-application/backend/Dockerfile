# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.11.0

FROM node:${NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package*.json .

RUN npm ci install

# Copy the rest of the source files into the image.
COPY . .

RUN npm run build

#Production stage
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/dist ./dist

# Expose the port that the application listens on.
EXPOSE 5000
EXPOSE 6000

CMD ["node", "dist/index.js"]