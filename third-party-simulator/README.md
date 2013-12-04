# simulator

This simulator exercises the new ItemPlayer launch api as defined 
[here](https://gist.github.com/evaneus/140bacbda8aab8ae25b0)

## installing

    npm install
    bower install

## running

* run the container in a different tab (see the container readme)
* then run this node app:

    ./bin/run

* the navigate to [http://localhost:5000](http://localhost:5000)

### Pointing to a different corespring host

If you need to test the app in a different environment (ie in a VM).
For example if you are running a VM that can access the host on 192.168.163.1 you can specify the corespring url by running: 

    http://192.168.163.1:5000?server=192.168.163.1:9000


The server url will be used to access the container.