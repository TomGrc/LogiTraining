function myTime(timeRange) {
    var d = new Date();
    var h = d.getHours() - timeRange;
    var m = d.getMinutes();
    return h + ":" + m;
}

function getEpochMillis(dateStr, timeStr) {
	var epochStr = dateStr + ' ' + timeStr;
	var d = new Date(epochStr);
	var unix_seconds = d.getTime();
	return unix_seconds;
};

function getEpochMillisAgain(dateStr, timeStr) {
	var epochStr = dateStr + ' ' + timeStr;
	var d = new Date(epochStr);
	var unix_seconds = d.getTime();
	return unix_seconds + " " + epochStr + " " + d;
};
