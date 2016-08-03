var ws = new WebSocket(document.location.origin.replace(/^http/, "ws") + "/ws")

ws._send = ws.send;
ws.send = function (data) {
	if (data.action && data.action != 'startLiveview' && data.action != 'getShootMode') {
		disableButtons()
	}

	ws._send(JSON.stringify(data))
}

ws.onopen = function (event) {
	console.log("WebSocket open")
	ws.send({ action: "getShootMode" })
	enableButtons()
	enableTakePicture()
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
		if (data.req.action !== 'actTakePicture') {
			enableTakePicture()
		}

		switch (data.req.action) {
			case 'actTakePicture':
				setPicture(data.res.result[0][0])
				break
			case 'timelapse':
				setMovie(data.res.result)
				break
			case 'getShootMode':
				if (data.res.result[0] === 'movie') {
					setView('movie')
				} else {
					setView('picture')
				}
				break
			case 'setShootMode':
				break
			case 'startMovieRec':
				startRec()
				break
			case 'stopMovieRec':
				stopRec()
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
