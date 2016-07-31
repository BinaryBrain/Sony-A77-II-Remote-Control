var ws = new WebSocket(document.location.origin.replace(/^http/, "ws") + "/ws")

ws._send = ws.send;
ws.send = function (obj) {
	ws._send(JSON.stringify(obj));
}

ws.onopen = function (event) {
	console.log("WebSocket open")
	enableButtons()
}

ws.onmessage = function (event) {
	console.log("WS RES:", event.data)

	var data = JSON.parse(event.data)

	if (data.res.error) {
		console.error(data.res.error)
	}

	if (data.res.result) {
		console.log(data.res.result)
		if (data.req.action === 'actTakePicture') {
			setPicture(data.res.result[[0]])
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
