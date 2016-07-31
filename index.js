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
				case 'focus':
					sendAction("setShootMode", ["movie"], function (data) {
						var data = JSON.parse(data)

						if (data.error) {
							cb(data)
						} else {
							setTimeout(function () {
								sendAction("setShootMode", ["still"], cb)
							}, 3000)
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