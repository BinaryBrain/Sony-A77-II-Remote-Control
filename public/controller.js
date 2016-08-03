window.onload = function () {
	onPageLoad()
}

var IS_REC = false

function onPageLoad() {
	disableButtons()

	var links = document.querySelectorAll('.link')
	;[].forEach.call(links, function (link) {
		link.addEventListener('click', function(event) {
			event.preventDefault()
			var mode = link.dataset.mode
			setMode(mode)
		});
	});

	document.querySelector('#actTakePicture').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'actTakePicture' })
		setTimeout(enableTakePicture, 7000)
	})

	document.querySelector('#focus').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'focus' })
	})

	document.querySelector('#startMovieRec').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'startMovieRec' })
	})

	document.querySelector('#stopMovieRec').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'stopMovieRec' })
	})

	document.querySelector('#startLiveview').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'startLiveview' })
	})

	document.querySelector('#startTimelapse').addEventListener('click', function(event) {
		event.preventDefault()

		var n = timelapseNumber.value
		var interval = timelapseInterval.value
		var fps = timelapseFps.value

		ws.send({ action: 'timelapse', params: { n: n, interval: interval, fps: fps } })
	})
}

function enableButtons() {
	var buttons = document.querySelectorAll('button:not(#actTakePicture)')

	;[].forEach.call(buttons, function(button) {
		button.disabled = false
	})
}

function enableTakePicture() {
	document.querySelector('#actTakePicture').disabled = false
}

function disableButtons() {
	var buttons = document.querySelectorAll('button')

	;[].forEach.call(buttons, function(button) {
		button.disabled = true
	})
}

function setPicture(url) {
	document.querySelector('#lastPicture').src = url
	document.querySelector('#lastPictureLink').href = url
}

function setMovie(url) {
	document.querySelector('#lastTimelapse').src = url
}

function setView(mode) {
	var views = document.querySelectorAll('.view')

	;[].forEach.call(views, function (view) {
		view.style.display = 'none'
	})

	document.querySelector('#view-' + mode).style.display = 'block'

	var links = document.querySelectorAll('.link')

	;[].forEach.call(links, function (link) {
		link.classList.remove('active')
	})

	document.querySelector('#link-' + mode).classList.add('active')
}

function setMode(mode) {
	setView(mode)

	if (mode === 'movie') {
		ws.send({ action: 'setShootMode', params: ['movie'] })
	} else {
		ws.send({ action: 'setShootMode', params: ['still'] })
	}
}

function startRec() {
	IS_REC = true

	document.querySelector('#startMovieRec').style.display = 'none'
	document.querySelector('#stopMovieRec').style.display = 'inline'
}

function stopRec() {
	IS_REC = false

	document.querySelector('#startMovieRec').style.display = 'inline'
	document.querySelector('#stopMovieRec').style.display = 'none'
}
