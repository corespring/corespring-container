FROM phusion/baseimage:0.9.16

# Default to UTF-8 file.encoding
ENV LANG C.UTF-8

RUN apt-get update && \
 apt-get upgrade -y && \
 apt-get install -y \
 wget \
 openjdk-7-jdk \
 nodejs \
 npm

# link nodejs -> node
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Mongo:
# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | tee /etc/apt/sources.list.d/10gen.list
RUN apt-get update && apt-get install -y mongodb-org
# Create the MongoDB data directory
RUN mkdir -p /var/lib/mongodb 

# Ruby 
RUN apt-get update && \
  apt-get install -y ruby ruby-dev ruby-bundler 

RUN mkdir /data
RUN mkdir /data/extras
ADD docker/extras/ /data/extras

### fakes3
RUN chmod +x /data/extras/fakes3-0.2.3.gem
RUN gem install builder
RUN gem install --backtrace -V --local /data/extras/fakes3-0.2.3.gem
RUN mkdir /opt/fake-s3-root
ENV ENV_AMAZON_ENDPOINT="http://localhost:4567"

EXPOSE 9000

RUN mkdir /data
ADD docker/scripts/main.sh /data/main.sh
RUN chmod +x /data/main.sh

RUN mkdir /opt/utils
ADD bin /opt/utils/bin
ADD mock-data /opt/utils/mock-data

ADD corespring-components/components /opt/components
ENV CONTAINER_COMPONENTS_PATH="/opt/components"

ADD target/universal/stage /opt/corespring-container

# Default to UTF-8 file.encoding
ENV LANG C.UTF-8

CMD ["/data/main.sh" ] 

# Clean up APT when done.
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
