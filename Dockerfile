# # ---------------------------
# # Dockerfile for NED Bank Server
# # ---------------------------
# FROM node:20-alpine

# # Create app directory
# WORKDIR /app

# # Copy dependency files first
# COPY package*.json ./

# # Install only production dependencies
# RUN npm ci --only=production

# # Copy rest of the code
# COPY . .

# # Set environment variables (Render or Docker Compose will override these)
# ENV NODE_ENV=production
# ENV PORT=5000

# # Expose the app port
# EXPOSE 5000

# # Run the app
# CMD ["node", "index.js"]
