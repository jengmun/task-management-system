# Base image (existing image)
# 16 is the tag of the image
FROM node:16

WORKDIR /usr/src/app
# There is a need to copy twice because Docker images are layer-based. When there is a change in any of the steps, all instructions below are re-executed and not cached.
COPY package.json ./

RUN npm install

COPY . .
# only for documentation, but doesn't really do anything. optional, but recommended to add
EXPOSE 5000

# Diff between CMD and RUN - CMD will be run when a container is created
CMD ["node", "server.js"]

# ============== NOTES ==============

# Containers are created from images. 1 image can have multiple containers running. Containers do not copy the code in the image. It is just a thin layer over the image

# Images are created using Dockerfile

# Docker build - creates an image from Dockerfile
# docker build . -t <username>/<app name>

# Images are read-only. Everytime external code is updated, we have to rebuild the image because Docker copies the files at the point in time that the image was created

# Docker run -p <localport>:<internal docker exposed port> <image id> - creates a container

# To restart container - docker start <container name>

# docker rm <container_name>
# docker container prune - deletes ALL stopped containers

# HOW TO SHARE IMAGES
# 1. Dockerfile
# 2. Share finished image

# VOLUME [ "/data" ] - link to local hard drive
# if container does not have data in volume, then it retrieves data from the volume, and vice versa


# named volumes help to persist data

# anonymous volumes are deleted whenever the containers shut down unlike named volumes

# -v feedback:/app/feedback

# Bind mounts

# we set the folder/path on the host machine, rather than docker automatically deciding it
# -v "absolutelocalpath:/dockerpath" OR -v "%cd%"":/app
# -v /app/node_modules - anonymous volume to make sure that the bind mount does not overwrite the node modules folders in the container
# bind mounts can help to update the container automatically without rebuilding

# CONTAINERS AND NETWORK REQUESTS
# Requests can be sent automatically to the internet. e.g. axios.get
# For databases, change localhost to host.docker.internal

# KUBERNETES
# CODE -> DOCKER -> KUBERNETES -> AWS