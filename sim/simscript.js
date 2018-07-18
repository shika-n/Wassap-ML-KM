var INTIAL_ZOOM = 0.5;

var dataPoints = [];
var centroidIter = [];
var showIterNo = 0;

var colorCollection = [
	"#e6194b",
	"#3cb44b",
	"#ffe119",
	"#0082c8",
	"#f58231",

	"#911eb4",
	"#46f0f0",
	"#f032e6",
	"#d2f53c",
	"#fabebe",

	"#008080",
	"#e6beff",
	"#aa6e28",
	"#fffac8",
	"#800000",

	"#aaffc3",
	"#808000",
	"#ffd8b1",
	"#000080",
	"#808080",

	"#2f0a9e",
	"#52b0de",
	"#6b20c8",
	"#8b7203",
	"#65bd77"
];

var xOffset = 0;
var zOffset = INTIAL_ZOOM;

var mouseX = 0;

function getMinMaxVal() {
	var minMaxVal = [0, 0];
	minMaxVal[0] = minMaxVal[1] = dataPoints[0].value;
	for (var i = 1; i < dataPoints.length; ++i) {
		var val = dataPoints[i].value;
		if (val < minMaxVal[0]) minMaxVal[0] = val;
		if (val > minMaxVal[1]) minMaxVal[1] = val;
	}
	
	return minMaxVal;
}

function drawDataPoints(canvasObj) {
	var minMaxVal = getMinMaxVal();
	var minVal = minMaxVal[0];
	var maxVal = minMaxVal[1];
	
	for (var i = 0; i < dataPoints.length; ++i) {
		canvasObj.ctx.beginPath();
		canvasObj.ctx.arc(canvasObj.width / 2 + zOffset * (-xOffset +
			(dataPoints[i].value - minVal) / (maxVal - minVal) * canvasObj.width),
			canvasObj.height / 2 - 5, 5, 0, 2 * Math.PI);

		if (dataPoints[i].parent != -1) {
			canvasObj.ctx.fillStyle = colorCollection[dataPoints[i].parent];
		} else {
			canvasObj.ctx.fillStyle = "#ffffff";
		}

		canvasObj.ctx.fill();
		canvasObj.ctx.stroke();

		if (Math.abs(mouseX
			- (canvasObj.width / 2 + zOffset * (-xOffset +
				(dataPoints[i].value - minVal) / (maxVal - minVal) * canvasObj.width))) < 10) {
			canvasObj.ctx.fillStyle = "#000000";
			canvasObj.ctx.font = "12px Arial";
			canvasObj.ctx.fillText(dataPoints[i].value.toFixed(5),
			canvasObj.width / 2 + zOffset * (-xOffset +
				(dataPoints[i].value - minVal) / (maxVal - minVal) * canvasObj.width),
				canvasObj.height / 2 - 15);
		}
	}
}

function getDataString(canvasObj) {
	var minMaxVal = getMinMaxVal();
	var minVal = minMaxVal[0];
	var maxVal = minMaxVal[1];

	var centOverData = false;
	var dataPointStr = "";

	if (showIterNo > 0) {
		for (var i = 0; i < centroidIter[showIterNo - 1].length; ++i) {
			if (Math.abs(mouseX
					- (canvasObj.width / 2 + zOffset * (-xOffset +
						(centroidIter[showIterNo - 1][i] - minVal) / (maxVal - minVal) * canvasObj.width))) < 10) {
				
				for (var j = 0; j < dataPoints.length; ++j) {
					if (dataPoints[j].parent == i) {
						dataPointStr += dataPoints[j].string + "<br><br>";
					}
				}
				centOverData = true;
			}
		}
	}
	
	if (!centOverData) {
		for (var i = 0; i < dataPoints.length; ++i) {
			if (Math.abs(mouseX
				- (canvasObj.width / 2 + zOffset * (-xOffset +
					(dataPoints[i].value - minVal) / (maxVal - minVal) * canvasObj.width))) < 10) {

				dataPointStr += dataPoints[i].string + "<br><br>";
			}
		}
	}

	return dataPointStr;
}

function drawCentroids(canvasObj) {
	var minMaxVal = getMinMaxVal();
	var minVal = minMaxVal[0];
	var maxVal = minMaxVal[1];

	for (var i = 0; i < centroidIter[showIterNo - 1].length; ++i) {
		canvasObj.ctx.beginPath();
		canvasObj.ctx.rect(canvasObj.width / 2 + zOffset * (-xOffset +
			(centroidIter[showIterNo - 1][i] - minVal) / (maxVal - minVal) * canvasObj.width) - 5,
			canvasObj.height / 2 + 5, 10, 10);

		canvasObj.ctx.fillStyle = colorCollection[i];

		canvasObj.ctx.fill();
		canvasObj.ctx.stroke();

		if (Math.abs(mouseX
				- (canvasObj.width / 2 + zOffset * (-xOffset +
					(centroidIter[showIterNo - 1][i] - minVal) / (maxVal - minVal) * canvasObj.width))) < 10) {
			canvasObj.ctx.fillStyle = "#000000";
			canvasObj.ctx.font = "12px Arial";
			canvasObj.ctx.fillText(centroidIter[showIterNo - 1][i].toFixed(5),
				canvasObj.width / 2 + zOffset * (-xOffset +
				(centroidIter[showIterNo - 1][i] - minVal) / (maxVal - minVal) * canvasObj.width) - 5,
				canvasObj.height / 2 + 30);
			
			var count = 0;
			for (var j = 0; j < dataPoints.length; ++j) {
				if (dataPoints[j].parent == i) ++count;
			}

			canvasObj.ctx.fillText(count,
				canvasObj.width / 2 + zOffset * (-xOffset +
				(centroidIter[showIterNo - 1][i] - minVal) / (maxVal - minVal) * canvasObj.width) - 5,
				canvasObj.height / 2 + 45);
		}
	}
}

function updateDataParent() {
	for (var i = 0; i < dataPoints.length; ++i) {
		dataPoints[i].parent = -1;
	}
	if (showIterNo > 0) {
		for (var i = 0; i < dataPoints.length; ++i) {
			var minDist = -1;
			for (var j = 0; j < centroidIter[showIterNo - 1].length; ++j) {
				var dist = Math.abs(dataPoints[i].value - centroidIter[showIterNo - 1][j]);
				if (minDist == -1 || dist <= minDist) {
					minDist = dist;
					dataPoints[i].parent = j;
				}
			}
		}
	}
}

function draw(canvasObj) {
	clearCanvas(canvasObj);
	drawDataPoints(canvasObj);
	drawCentroids(canvasObj);
}

function clearCanvas(canvasObj) {
	canvasObj.ctx.clearRect(0, 0, canvasObj.width, canvasObj.height);
}

window.onload = function() {
	var fileInput = document.getElementById("fileToRead");
	var content = document.getElementById("fileContent");
	var btnSContent = document.getElementById("SContent");
	var btnRefresh = document.getElementById("cRefresh");
	var btnPrev = document.getElementById("cPrev");
	var btnNext = document.getElementById("cNext");
	var txtIterNo = document.getElementById("iterNo");
	var txtDataPointStr = document.getElementById("dataPointString");

	var canvasObj = {
		canvas: document.getElementById("canvas"),
		ctx: canvas.getContext("2d"),
		width: canvas.getAttribute("width"),
		height: canvas.getAttribute("height")
	};

	canvasObj.width = document.body.clientWidth - 2;
	canvasObj.canvas.setAttribute("width", canvasObj.width);
	canvasObj.canvas.setAttribute("style", "margin: 0; border: 1px solid #000000;");

	txtDataPointStr.setAttribute("style", "width: " + canvasObj.width + "; overflow: auto; border: 1px solid #000000;");
	
	xOffset = canvasObj.width / 2;
	zOffset = INTIAL_ZOOM;
	
	fileInput.addEventListener('change', function(e) {
		var fileToRead = fileInput.files[0];
		var fileReader = new FileReader();
		
		var res;
		var fileContent;

		showIterNo = 0;

		fileReader.onload = function(e) {
			fileContent = fileReader.result.split('\n');
			res = fileReader.result;
			content.innerText = fileContent;
			
			dataPoints = [];
			centroidIter = [];

			var dataFlag = true;
			var iterNo = 0;
			for (var i = 0; i < fileContent.length; ++i) {
				var line = fileContent[i];
				if (line.startsWith("====Data Points")) {
					dataFlag = true;
					continue;
				} else if (line.startsWith("====Centroid Iteration No.")) {
					dataFlag = false;
					centroidIter.push([]);
					iterNo++;
					continue;
				}
				
				if (dataFlag) {
					var data = {
						value: 0,
						parent: -1,
						string: ""
					};
					splittedLine = line.split(" - ")
					data.value = parseFloat(splittedLine[0]);
					data.string = splittedLine[1];
					dataPoints.push(data);
				} else {
					var value = parseFloat(line);
					centroidIter[iterNo - 1].push(value);
				}
			}
		}
		
		fileReader.readAsText(fileToRead);
	});

	btnRefresh.addEventListener('click', function(e) {
		var lastWidth = canvasObj.width;
		canvasObj.width = document.body.clientWidth - 2;
		canvasObj.canvas.setAttribute("width", canvasObj.width);
	
		txtDataPointStr.setAttribute("style", "width: " + canvasObj.width + "; overflow: auto; border: 1px solid #000000;");

		xOffset = xOffset - lastWidth / 2 + canvasObj.width / 2;

		txtIterNo.innerText = "Iter No. " + showIterNo;
		draw(canvasObj);
	});

	btnNext.addEventListener('click', function(e) {
		showIterNo++;
		if (showIterNo < 0) showIterNo = 0;
		if (showIterNo > centroidIter.length) showIterNo = centroidIter.length;
	
		txtIterNo.innerText = "Iter No. " + showIterNo;

		updateDataParent();
		draw(canvasObj);
	});

	btnPrev.addEventListener('click', function(e) {
		showIterNo--;
		if (showIterNo < 0) showIterNo = 0;
		if (showIterNo > centroidIter.length) showIterNo = centroidIter.length;
		
		txtIterNo.innerText = "Iter No. " + showIterNo;

		updateDataParent();
		draw(canvasObj);
	});

	var mouseDown = false;
	var xLast = 0;

	canvasObj.canvas.addEventListener('mousedown', function(e) {
		mouseDown = true;
		xLast = e.clientX;
		
		txtDataPointStr.innerHTML = getDataString(canvasObj);
	});
	canvasObj.canvas.addEventListener('mouseup', function(e) {
		mouseDown = false;
	});
	canvasObj.canvas.addEventListener('mousemove', function(e) {
		mouseX = e.clientX;
		if (mouseDown) {
			xOffset += (xLast - e.clientX) / zOffset;
			xLast = e.clientX;
		}
		draw(canvasObj);
	});

	canvasObj.canvas.addEventListener('mousewheel', function(e) {
		if (zOffset + e.wheelDelta / 1000 > 0) zOffset += e.wheelDelta / 1000 * zOffset;
		draw(canvasObj);
	});

	var hidden = true;
	btnSContent.addEventListener('click', function(e) {
		if (hidden) {
			content.setAttribute("style", "width: 300; height: 300; overflow: auto; border: 1px solid #000000;");
			hidden = false;
			btnSContent.innerHTML = "Hide";
		} else {
			content.setAttribute("style", "width: 300; height: 0; overflow: auto;");
			hidden = true;
			btnSContent.innerHTML = "Show";
		}
	});
}