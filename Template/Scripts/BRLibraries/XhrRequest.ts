export interface xhrOptions {
	HttpVerb?: string,
	bustCache?: boolean
	postData?: string,
	form?: HTMLFormElement,
	formObject?: any,
	reloadOn401?: boolean,
	contentType?: string,
	noContentType?: boolean,
	splitLines?: boolean,
	returnAsJson?: boolean,
	success?: Function,
	failure?: Function,
	finally?: Function,
	stream?: Function,
}

/**
* Convert form elements to name=value pairs string
* @param {HTMLFormElement} f - HTMLFormElement
* @returns {string} - '' if no elements
* @throws exception if f doesn't contain elements
*/
export function formToString(f: HTMLFormElement): string {
	var string = '';
	for (var i = 0; i < f.elements.length; i++) {
		let element = f.elements[i] as HTMLFormElement;
		if (string != '') { string += '&'; }
		if (element.name) {
			string += element.name + '=' + encodeURIComponent(element.value);
		}
	}
	return string;
}


/**
* Convert form elements and values to json object
* @param {string} f - HTMLFormElement or object (directly returned)
* @returns {Record<string, string>} - {} if no elements
*/
export function formToJson(f: HTMLFormElement): Record<string, string> {
	var obj: Record<string, string> = {};
	for (var i = 0; i < f.elements.length; i++) {
		let element = f.elements[i] as HTMLFormElement;
		if ((f.elements[i] as HTMLFormElement).name) {
			var val = element.value;
			if (val == '' && f.elements[i].getAttribute('data-nullonempty') == 'true') {
				val = null;
			} else if (f.elements[i].getAttribute('data-type') == 'int') {
				val = parseInt(val);
			} else if (f.elements[i].getAttribute('data-type') == 'float') {
				val = parseFloat(val);
			} else if (f.elements[i].getAttribute('data-type') == 'bool') {
				val = val.toLowerCase() == 'true';
			}
			if (f.element.type == 'checkbox') {
				val = element.checked;
			}
			obj[element.name] = val;
		}
	}
	return obj;
}

/**
* Convert form elements and values to json string
* @param {string} f - HTMLFormElement or object (directly returned)
* @returns {string} - Json string
*/
export function formToJsonString(f: HTMLFormElement): string {
	return JSON.stringify(formToJson(f));
}


/**
* Send Xhr Request to Server (optional args = { HttpVerb = 'POST', bustCache = true, postData (name=value string), form (HTMLFormElement or Object), reloadOn401 = true, contentType = [various defaults], noContentType = false, success(Json, XMLHttpRequest), failure(XMLHttpRequest, JsonParseFailed:bool), finally(XMLHttpRequest) })
* @param {string} url - Url to call incl any query string
* @param {object} [args]
* @returns {XMLHttpRequest}
*/
export function getJson(url: string, args: xhrOptions): XMLHttpRequest {
	
	return makeXhrRequest(url, {
		HttpVerb: args.HttpVerb,
		bustCache: args.bustCache,
		postData: args.formObject ? JSON.stringify(args.formObject) : (args.form ? formToJsonString(args.form) : args.postData),
		reloadOn401: args.reloadOn401,
		contentType: args.contentType || (args.form || args.formObject ? "application/json" : undefined),
		noContentType: args.noContentType,
		success: function(xhr: XMLHttpRequest) {
			var json = null;
			try {
				json = JSON.parse(xhr.responseText);
			} catch (e) {
			}
			if (json) {
				if (args.success) {
					args.success(json, xhr);
				}
			} else {
				if (args.failure) {
					args.failure(xhr, true);
				}
			}
		},
		failure: function(xhr: XMLHttpRequest) {
			if (args.failure) {
				args.failure(xhr, false);
			}
		},
		finally: function (xhr: XMLHttpRequest) {
			if (args.finally) {
				args.finally(xhr);
			}
		}
	});
}


/**
* Send Xhr Request to Server (optional args = { returnAsJson = true, spiltLines = true, HttpVerb = 'POST', bustCache = true, postData (name=value string), form (HTMLFormElement or Object), reloadOn401 = true, contentType = [various defaults], noContentType = false, stream(Json, XMLHttpRequest), success(Json, XMLHttpRequest), failure(XMLHttpRequest, JsonParseFailed:bool), finally(XMLHttpRequest) })
* @param {string} url - Url to call incl any query string
* @param {object} [args]
* @returns {XMLHttpRequest}
*/
export function getStream(url: string, args: xhrOptions): XMLHttpRequest {

	xhrStreamReceivedText = '';
	return makeXhrRequest(url, {
		HttpVerb: args.HttpVerb,
		bustCache: args.bustCache,
		postData: args.formObject ? JSON.stringify(args.formObject) : (args.form ? formToJsonString(args.form) : args.postData),
		reloadOn401: args.reloadOn401,
		contentType: args.contentType || (args.form || args.formObject ? "application/json" : undefined),
		noContentType: args.noContentType,
		stream: function (xhr: XMLHttpRequest) {
			var newText = xhr.responseText.slice(xhrStreamReceivedText.length);
			xhrStreamReceivedText = xhr.responseText;
			if (args.stream) {
				var lines = newText.split(args.splitLines === false ? '' : '\n');
				for (var i = 0; i < lines.length; i++) {
					if (args.splitLines === false || lines[i] != '') {
						if (args.returnAsJson !== true) {
							args.stream(lines[i], xhr);
						} else {
							var json = null;
							try {
								json = JSON.parse(lines[i]);
							} catch (e) {
							}
							if (json) {
								args.stream(json, xhr);
							} else {
								if (args.failure) {
									args.failure(xhr, true, lines[i]);
								}
							}
						}
					}
				}
            }
        },
		success: function (xhr: XMLHttpRequest) {
			if (args.success) {
				args.success(xhr);
			}
		},
		failure: function (xhr: XMLHttpRequest) {
			if (args.failure) {
				args.failure(xhr);
			}
		},
		finally: function (xhr: XMLHttpRequest) {
			if (args.finally) {
				args.finally(xhr);
			}
		}
	});
}
var xhrStreamReceivedText: string;


/**
* Send Xhr Request to Server (optional args = { HttpVerb = 'POST', bustCache = true, postData, reloadOn401 = true, contentType = [various defaults], noContentType = false, stream(XMLHttpRequest), success(XMLHttpRequest), failure(XMLHttpRequest), finally(XMLHttpRequest) })
* @param {string} url - Url to call incl any query string
* @param {object} [args]
* @returns {XMLHttpRequest}
*/
export function makeXhrRequest(url: string, args: xhrOptions): XMLHttpRequest {

	var httpVerb = args.HttpVerb || 'POST';
	var bustCache = args.bustCache === undefined ? false : args.bustCache;
	var postData = args.postData || '';
	var reloadOn401 = args.reloadOn401 === undefined ? true : args.reloadOn401;

	var noContentType = args.noContentType === undefined ? false : args.noContentType;
	var contentType = args.contentType || null;
	if (contentType == null && (httpVerb == 'POST' || httpVerb == 'PUT')) {
		contentType = 'application/x-www-form-urlencoded';
    }

	var xhrRequest = new XMLHttpRequest();
	if (xhrRequest) {
		xhrRequest.onreadystatechange = function () {
			if (xhrRequest.readyState == 3 && args.stream) {
				args.stream(this);
            }
			if (xhrRequest.readyState == 4) {
				if (xhrRequest.status == 401 && reloadOn401) {
					location.reload();
                }
				if (xhrRequest.status == 200) {
					if (args.success) {
						args.success(this)
					}
				} else {
					if (args.failure) {
						args.failure(this);
					}
				}
				if (args.finally) {
					args.finally(this);
				}
			}
		}

		if (bustCache) {
			url += (url.indexOf('?') == -1 ? '?' : '&') + 't=' + new Date().valueOf();
        }
		xhrRequest.open(httpVerb, url, true);

		if (!noContentType && contentType != null) {
			xhrRequest.setRequestHeader('Content-type', contentType);
		}

		xhrRequest.send(postData);
	}
	return xhrRequest;
}