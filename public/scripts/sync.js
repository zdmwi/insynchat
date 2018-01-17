var syncArea = {};
var syncWindow = document.getElementsByClassName('sync-window')[0];

// settings
var SETTINGS = {
	lineWidth: 5,
	strokeStyle: '#222',
	lineCap : 'round',
}
// user state
var USER = {
	isdrawing: false
}

syncArea.initCanvas = function () {
    syncArea.canvas = document.createElement('canvas');
	syncArea.canvas.height = syncWindow.clientHeight;
	syncArea.canvas.width = syncWindow.clientWidth;
	syncWindow.appendChild(syncArea.canvas);
	syncArea.ctx = syncArea.canvas.getContext('2d');

	// add event listeners
	syncArea.canvas.addEventListener('mousedown', onMouseDown);
	syncArea.canvas.addEventListener('mousemove', onMouseMove);
	syncArea.canvas.addEventListener('mouseup', onMouseUp);
	syncArea.canvas.addEventListener('mouseout', onMouseUp);
}

syncArea.requestToDraw = function () {
	socket.emit('requesttodraw', {
		text: 'User would like to draw!',
	});
	if (!$('canvas').length) {
		$('.sync-window-watermark').toggle();
		$('#canvas-settings').removeClass('force-hidden');

		syncArea.initCanvas();
		console.log('canvas created');
	} else {
		$('#canvas-settings').addClass('force-hidden');
		$('.sync-window-watermark').toggle();
		syncArea.canvas.parentNode.removeChild(syncArea.canvas);
	}
}
// sync window controls
var drawButton = document.getElementById('draw');
drawButton.addEventListener('click', syncArea.requestToDraw);

function drawLine(x0, y0, x1, y1, SETTINGS, emit) {
	syncArea.ctx.beginPath();
	syncArea.ctx.moveTo(x0, y0);
	syncArea.ctx.lineTo(x1, y1);
	syncArea.ctx.lineWidth = SETTINGS.lineWidth*1.5;
	syncArea.ctx.strokeStyle = SETTINGS.strokeStyle;
	syncArea.ctx.lineCap = SETTINGS.lineCap;
	syncArea.ctx.stroke();
	syncArea.ctx.closePath();

	if (!emit) { return; }
	var w = syncArea.canvas.width;
	var h = syncArea.canvas.height;

	socket.emit('drawing', {
		x0: x0 / w,
		y0: y0 / h,
		x1: x1 / w,
		y1: y1 / h,
		SETTINGS: SETTINGS
	});
}

function onMouseDown(e) {
	if (e.which == 3) { return; }
	USER.isDrawing = true;
	USER.x = e.offsetX;
	USER.y = e.offsetY;
}

function onMouseUp(e) {
	if (!USER.isDrawing) { return; }
	USER.isDrawing = false;
	drawLine(USER.x, USER.y, e.offsetX, e.offsetY, SETTINGS, true);
}

function onMouseMove(e) {
	if (!USER.isDrawing || e.which == 3) { return; }
	drawLine(USER.x, USER.y, e.offsetX, e.offsetY, SETTINGS, true);
	USER.x = e.offsetX;
	USER.y = e.offsetY;
}