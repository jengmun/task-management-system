# Base image (existing image)
# 16 is the tag of the image
FROM node:16.3.0-alpine
# -S : create system group/user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

USER appuser

# to check user: docker run image_name id

WORKDIR /usr/src/app
# There is a need to copy twice because Docker images are layer-based. When there is a change in any of the steps, all instructions below are re-executed and not cached.
COPY package.json ./

RUN npm install

COPY . .

# BUILD ARGS 
# ARG DEFAULT_PORT=5000
# ENV PORT $DEFAULT_PORT
# only for documentation, but doesn't really do anything. optional, but recommended to add
# EXPOSE $PORT
EXPOSE 5000

# Note: this is for internal port! External ports can be set when you run the container!
# docker run -p 7000:6000 --env PORT=6000 -d --rm paperrains/tms
# The :6000 is to tell docker what port it is running on
# The PORT=6000 is to change the .env variable within the file so that the server.js file will listen to the correct port

# only need to include --env-file when u change the env AFTER you have built the image
# or you can simply run as a command

# --build-arg DEFAULT_PORT=8000

# Diff between CMD and RUN - CMD will be run when a container is created
CMD ["npm", "start"]


# Commands
# docker build . -t tms
# docker run -d -p 5000:5000 --env DB_PASSWORD=Hello tms

# docker save tms -o tms.tar
# certutil -hashfile tms.tar MD5
# docker load -i tms.tar
# whoami