/* PEN TOOL MECHANICS*/
var minRad = 1;
var maxRad = 20;

var $pensize = $('#pensize');
var $decRad = $('#decrad');
var $incRad = $('#incrad');

function setRadius (newRadius) {
	if (newRadius < minRad) {
		newRadius = minRad;
	}
	else if (newRadius > maxRad) {
		newRadius = maxRad;
	}
	SETTINGS.lineWidth = newRadius;
	syncArea.ctx.lineWidth = SETTINGS.lineWidth*2;
	$pensize.css("height", newRadius*2);
	$pensize.css("width", newRadius*2);
}

$decRad.on('click', function () {
	setRadius(--SETTINGS.lineWidth);
});

$incRad.on('click', function () {
	setRadius(++SETTINGS.lineWidth);
});

/* COLOR MECHANICS */

$swatch = $('#swatch');

// list of colors that are available
var colors = ['#222222','#ffffff','#7F8C8D','#4e4a4e','#716E61',
							'#86949F','#D7E7D0','#462428','#814D30','#D3494E',
							'#CD7F32','#D4A798','#E3CF57','#333366','#5D76CB',
							'#7AC5CD','#215E21','#71AA34'];

// creates the colors when the document has loaded. To be refactored to create the swatches when the draw button is clicked
$(document).ready(function () {
	colors.forEach(function (color) {
		$swatch.append('<div class="swatch-color" style="background-color: '+ color +'"></div>');
	});
	$swatch = $('.swatch-color');
	$activeColor = $('#active-color');

	$swatch.on('click', function () {
		 $activeColor.css('background-color', $(this).css('background-color'));
		 SETTINGS.strokeStyle = $(this).css('background-color');
	}); 
});

/* SAVE MECHANICS */

var $saveButton = $('#download-btn');

$saveButton.on('click', function () {
	var data = syncArea.canvas.toDataURL();
	window.open(data, '_blank', 'location=0, menubar=0');
});

/* UPLOAD MECHANICS */

$uploadBtn = $('#file-upload');

$uploadBtn.on('change', function (e) {
	var reader = new FileReader();
	reader.onload = function (event) {
		var img = new Image();
		img.onload = function () {
			syncArea.ctx.rect(0,0,syncWindow[0].clientWidth,syncWindow[0].clientHeight);
			syncArea.ctx.fillStyle = '#fff';
			syncArea.ctx.fill();
			syncArea.ctx.drawImage(img, 0, 0);
		}
		img.src = event.target.result;
		console.log(img.src);
		socket.emit('uploadimg', {
		src: img.src,
	});
	}
	reader.readAsDataURL(e.target.files[0]);
	//var data = syncArea.canvas.toDataURL();
});

//Convert to data url
//Read data url with file reader