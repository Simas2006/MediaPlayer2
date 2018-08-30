# MediaPlayer2
A MediaPlayer, with one screen on the TV and one on a mobile device.

### How to Setup

Prerequisites:
  - NodeJS ([available here](https://nodejs.org))
  - Mac/Linux Computer

On TV computer:

Download the MP2 Mac app [here](https://github.com/Simas2006/MediaPlayer2/releases/latest) and install it to your Applications directory. On your first opening of the app, you will be prompted with a page to setup your password, as well as your Server ID, which will be necessary to connect to your server.

After your password is created, you will be taken with the main page. Press the "Open Folder" link, and you will be prompted with a Finder window with two subfolders, "music" and "photos". Place albums of music and photos in their respective directories, but do not leave any given album empty.

On Mobile:

Download the Expo app (if you don't have it already), and open in your browser of choice MP2's app's Expo page [here](https://expo.io/@simas06/mp2-mobile-app), and press the "Open project using Expo" button to open the app automatically. To login, enter the Server ID and Password you were given or set on the TV. You will then be sent to the main page.

### Things to Note

- The server WILL NOT work on Windows, as Node's default installation is different. It has not been tested on Linux, but should work as long as your Node install is at `/usr/local/bin/node`.
- On Mac, the data folder will be at `~/Library/Application Support/MediaPlayer2`, and on Linux it is at `/var/local`
- The server is password protected, protected against `..`s, and all messages are encrypted, but do not run this app over a non-LAN network for security (just in case).
- The mobile app has not been on Android, but has been tested on all (real model) sizes of iPhone.
- This app is licensed under the Apache License. Feel free to expand on the app and make it more cross-platform/better in general!

I know some of these things may not be ideal, these were my requirements, and it Works On My Machine™.

### DLP?

DLP stands for "Download Proxy". It allows you to download and view pictures stored within MediaPlayer2. In the main app, click to enable the DLP server, and in the DLP client app, enter the IP of the server and the password (it will be the same as for the mobile app).

Within the app, you will have access both to albums you have downloaded (which use the same resize algorithm as the main app), and to download new albums over a secure connection. The DLP client app works offline too.

Download the DLP client app [here](https://github.com/Simas2006/MediaPlayer2/releases/latest). It does not require Node to be preinstalled.
