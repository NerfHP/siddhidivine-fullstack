# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the default Nginx configuration
# This allows React Router to handle routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# You will need to create an nginx.conf file in the client directory:
#
# server {
#     listen 80;
#     server_name localhost;
#
#     location / {
#         root   /usr/share/nginx/html;
#         index  index.html index.htm;
#         try_files $uri $uri/ /index.html;
#     }
#
#     error_page   500 502 503 504  /50x.html;
#     location = /50x.html {
#         root   /usr/share/nginx/html;
#     }
# }
#