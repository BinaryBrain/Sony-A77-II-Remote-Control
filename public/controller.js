window.onload = function () {
	onPageLoad()
}

function onPageLoad() {
	disableButtons()

	document.querySelector('#actTakePicture').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'actTakePicture' })
	})

	document.querySelector('#focus').addEventListener('click', function(event) {
		event.preventDefault()
		ws.send({ action: 'focus' })
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
