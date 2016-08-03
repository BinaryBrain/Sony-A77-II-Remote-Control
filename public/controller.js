window.onload = function () {
	onPageLoad()
}

var SHOOT_MODE = "movie"
var IS_REC = false

function onPageLoad() {
	disableButtons()

	document.querySelector('#shootModeMovie').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'setShootMode', params: ['movie'] })
	})

	document.querySelector('#shootModeStill').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'setShootMode', params: ['still'] })
	})

	document.querySelector('#actTakePicture').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'actTakePicture' })
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
}

function enableButtons() {
	var buttons = document.querySelectorAll('button')

	;[].forEach.call(buttons, function(button) {
		button.disabled = false
	})
}

function disableButtons() {
	var buttons = document.querySelectorAll('button')

	;[].forEach.call(buttons, function(button) {
		button.disabled = true
	})
}

function setPicture(url) {
	document.querySelector('#lastPicture').src = url
}

function toogleShootModeStill() {
	stopRec()

	document.querySelector('#shootModeMovie').style.display = 'inline'
	document.querySelector('#shootModeStill').style.display = 'none'

	document.querySelector('#actTakePicture').style.display = 'inline'
	document.querySelector('#focus').style.display = 'inline'
	document.querySelector('#startMovieRec').style.display = 'none'
	document.querySelector('#stopMovieRec').style.display = 'none'
}

function toogleShootModeMovie() {
	document.querySelector('#shootModeMovie').style.display = 'none'
	document.querySelector('#shootModeStill').style.display = 'inline'

	document.querySelector('#actTakePicture').style.display = 'none'
	document.querySelector('#focus').style.display = 'none'
	document.querySelector('#startMovieRec').style.display = 'inline'
	document.querySelector('#stopMovieRec').style.display = 'none'
}

function updateShootMode() {
	if (SHOOT_MODE === 'movie') {
		toogleShootModeMovie()
	} else {
		toogleShootModeStill()
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
