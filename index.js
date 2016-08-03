var express = require('express')
var app = express()
var expressWs = require('express-ws')(app)
var querystring = require('querystring')
var http = require('http')
var fs = require('fs')

app.use(express.static('public'))

app.ws('/ws', function(ws, req) {
	ws.on('message', function(reqData) {
		console.log(reqData)
		
		try {
			var msg = JSON.parse(reqData)

			var cb = function (resData) {
				ws.send(JSON.stringify({ req: msg, res: JSON.parse(resData) }))
			}

			switch (msg.action) {
				case 'actTakePicture':
					sendAction("actTakePicture", [], cb)
					break
				case 'startLiveview':
					sendAction("startLiveview", [], function (data) {
						var data = JSON.parse(data)

						startLiveview(data.result[0], ws)
					})
					break
				case 'focus':
					sendAction("setShootMode", ["movie"], function (data) {
						var data = JSON.parse(data)

						if (data.error) {
							cb(data)
						} else {
							setTimeout(function () {
								sendAction("setShootMode", ["still"], cb)
							}, 2000)
						}
					})
					break
				default:
					ws.send('Unknown action:' + msg)
					break
			}
		} catch (err) {
			console.error(err)
			ws.send('Error: malformed JSON')
		}
	})
})

app.get('/', function (req, res) {
	res.send('Hello World!')
})

app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
})


function sendAction(action, params, cb) {
	params = params || []

	var postData = JSON.stringify({
		"method": action,
		"params": params,
		"id": 1, // TODO random
		"version": "1.0"
	})

	var options = {
		hostname: '192.168.122.1',
		port: 10000,
		path: '/sony/camera',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': postData.length
		}
	}

	var req = http.request(options, function(res) {
		res.setEncoding('utf8')
		
		console.log('STATUS: ' + res.statusCode)
		console.log('HEADERS: ' + JSON.stringify(res.headers))
		
		var body = ''
		res.on('data', function (chunk) {
			body += chunk
		})

		res.on('end', function () {
			console.log('BODY: ' + body)
			if (cb) {
				cb(body)
			}
		})
	})

	req.on('error', function(e) {
		console.error('problem with request: ' + e.message)
	})

	// write data to request body
	req.write(postData)
	req.end()
}

var COMMON_HEADER_SIZE = 8
var PAYLOAD_HEADER_SIZE = 128
var JPEG_SIZE_POSITION = 4
var PADDING_SIZE_POSITION = 7

function startLiveview(url, ws) {
	var jpegDataLeft = 0
	var paddingSize = 0

	var liveviewReq = http.request(url, function (liveviewRes) {
		liveviewRes.on('data', function (chunk) {
			decode(chunk)
		})

		liveviewRes.on('end', function () {
			console.log('End')
		})

		liveviewRes.on('close', function () {
			console.log('Close')
		})
	})

	liveviewReq.on('error', function(e) {
		console.error('Error: ', e)
	})

	liveviewReq.end()
}

var frameNo = 0
var isNewPacket = true
var jpegDataLeft = 0
var paddingSize = 0
var frame = new Buffer(0)

function decode(c) {
	var debug = false

	if (isNewPacket) {
		if (debug) console.log('---------')

		if (c.readUInt8(0) !== 255) {
			console.warn("First byte is not 0xFF.")
			return
		}

		// Common Header
		var payloadType = c.readUInt8(1)
		if (debug) console.log("Payload type:", payloadType)

		frameNo = c.readUInt16BE(2)
		if (debug) console.log("Frame no:", frameNo)

		var timestamp = c.readUInt32BE(2)

		// Payload Header
		if (c.readUInt8(COMMON_HEADER_SIZE + 0) !== 0x24 ||
			c.readUInt8(COMMON_HEADER_SIZE + 1) !== 0x35 ||
			c.readUInt8(COMMON_HEADER_SIZE + 2) !== 0x68 ||
			c.readUInt8(COMMON_HEADER_SIZE + 3) !== 0x79) {
			console.warn("Payload header beginning should be 0x24, 0x35, 0x68 or 0x79.")
			return
		}

		var payloadSize = c.readUIntBE(COMMON_HEADER_SIZE + 4, 3)
		if (debug) console.log("Payload size:", payloadSize)

		paddingSize = c.readUIntBE(COMMON_HEADER_SIZE + 7)
		if (debug) console.log("Padding size:", paddingSize)

		if (payloadType == 0x01) {
			// 128 bytes reserved

			// end of header
			// Payload Data
			jpegDataLeft = payloadSize
			var end = Math.min(COMMON_HEADER_SIZE + PAYLOAD_HEADER_SIZE + jpegDataLeft, c.length)
			var imgData = c.slice(COMMON_HEADER_SIZE + PAYLOAD_HEADER_SIZE, end)
			frame = imgData
			jpegDataLeft -= imgData.length

			if (jpegDataLeft > 0) {
				isNewPacket = false
			}
		} else if (payloadType == 0x02) {
			var version = c.readUIntBE(COMMON_HEADER_SIZE + 8) + "." + c.readUIntBE(COMMON_HEADER_SIZE + 9)
			if (debug) console.log("Version:", version)

			// end of header
			// Payload Data

		} else {
			console.warn("Payload type should be 1 or 2.")
		}
	} else {
		var end = Math.min(jpegDataLeft, c.length)
		var imgData = c.slice(0, end)
		frame = Buffer.concat([frame, imgData])
		jpegDataLeft -= imgData.length

		if (jpegDataLeft == 0) {
			if (debug) console.log('End of image', frame.length)
			isNewPacket = true

			var clients = expressWs.getWss('/ws').clients
			if (clients.length == 0) {
				sendAction('stopLiveview')
			}

			clients.forEach(function (ws) {
				ws.send(frame)
			})


			// fs.writeFile("frame-" + frameNo, frame, 0, frame.length)
		}
	}
}
