Sony α77 II Remote Control
==========================

The purpose of this project is to have a nice remote controller for the Sony α77 II running on a computer.
However, it should work with most Sony cameras since it only uses basic API calls.

The server is in Node.js and the client is a web page.

Setup
-----

This is a little guide if you want to deploy the project.

### Node server

1. Make sure [Node.js](https://nodejs.org/) is installed (≥ 6.2.0)
2. Install dependencies: `npm install`
3. Run: `node index.js`
4. Open a browser and go to [http://localhost:3000](http://localhost:3000)

### Camera

On your camera:

1. Click on the **MENU** button
2. Go to the 3rd tab, 1st page, and choose **Ctrl w/ Smartphone**

On your computer:

1. Connect to the Wi-Fi hotspot created by the camera
2. Check that the IP address of your "router" (which is in fact the camera) is `192.168.122.1`.
If it's not, you have to change the IP address in the [server file](index.js#L1).
