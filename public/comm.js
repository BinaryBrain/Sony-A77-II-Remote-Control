var ws = new WebSocket(document.location.origin.replace(/^http/, "ws") + "/ws")

// ws.binaryType = "arraybuffer"

ws._send = ws.send;
ws.send = function (data) {
	if (data.action && data.action != 'startLiveview') {
		disableButtons()
	}

	ws._send(JSON.stringify(data))
}

ws.onopen = function (event) {
	console.log("WebSocket open")
	enableButtons()
}

ws.onmessage = function (event) {
	// Liveview data
	if (event.data instanceof Blob) {
		var img = document.querySelector('#liveview')
		img.src = URL.createObjectURL(event.data)
		return
	}

	console.log("WS RES:", event.data)
	enableButtons()
	var data = JSON.parse(event.data)

	if (data.res.error) {
		console.error(data.res.error)
	}

	if (data.res.result) {
		console.log(data.res.result)
		switch (data.req.action) {
			case 'actTakePicture':
				setPicture(data.res.result[[0]])
				break
		}
	}
}

ws.onclose = function (event) {
	// TODO handle me!
	console.warn("WebSocket closed:", event)
	disableButtons()
}

ws.onerror = function (event) {
	// TODO handle me!
	console.error("WebSocket error:", event)
}
