Georef
======

A user-friendly webapp for converting normal images into GeoTiffs.


Deploying
---------

This requires [Docker] (https://www.docker.com/products/docker-engine) and [Docker Machine] (https://www.docker.com/products/docker-machine). You will also need to clone this repository.

If you are deploying locally and you are not running Linux you will need to create a virtual machine. This requires [Virtualbox] (https://www.virtualbox.org/). We are going to be using port 3030 to access Georef, so that needs to be exposed too. This can be done as so:

    $ docker-machine create -d virtualbox georef
    $ eval "$(docker-machine env georef)"
    $ VBoxManage controlvm georef natpf1 'georef,tcp,,4000,,4000'

Alternately, if you are deploying to AWS, you will need to create an EC2 machine instead:

    $ docker-machine create -d amazonec2 \
        --amazonec2-region 'eu-west-1' \
        --amazonec2-instance-type 't2.nano' \
        georef
    $ eval "$(docker-machine env georef)"

(You will also need to expose port 3030 via the AWS Console.)

Next, build and run the Dockerfile:

    $ docker build -t georef .
    $ docker run --name georef -dp 3030:3030 georef

Georef should now be available on port 3030 of your machine.
