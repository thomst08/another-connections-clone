
Another Connections Clone
=================

'Another Connections Clone' is a project that sets out to replicate the NYTimes connection game with a few tweaks.  This is to look and act mostly the same as the original game, however, this version does not have a life system but counts the number of errors instead of ending the game after 4 failed attempts.

<br />
<br />

Docker Set-up & Start
==================

Open a command prompt/terminal and then use the following command create and start the container:

```
    docker run -d \
      --name another-connections-clone \
      -p 5173:5173 \
      --restart=unless-stopped \
      thomst08/another-connections-clone:latest
```


Build Instructions
==================

Run the following commands in the projects root directory.

```
npm install
npm run dev
```

To build and serve the project.

```
npm run build
npm run preview
```