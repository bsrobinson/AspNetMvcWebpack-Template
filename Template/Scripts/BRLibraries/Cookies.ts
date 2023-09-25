/**
* Set a Cookie
* @param {string} name - Name of Cookie
* @param {string} value - Value of Cookie
* @param {string} days - Duration of Cookie in Days
*/
export function createCookie(name: string, value: string, days: number | null = null) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toUTCString();
	}
	else var expires = "";
	document.cookie = name + "=" + value + expires + "; path=/";
}

/**
* Reads a Cookie
* @param {string} name - Name of Cookie
* @returns {string} value of the cookie
*/
export function readCookie(name: string) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

/**
* Deletes a Cookie
* @param {string} name - Name of Cookie
*/
export function eraseCookie(name: string) {
	createCookie(name, "", -1);
}