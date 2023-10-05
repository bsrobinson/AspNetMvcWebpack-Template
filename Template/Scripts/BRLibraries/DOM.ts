
export interface ElementAttributes {
    
    html?: string | null,
    id?: string,
    class?: string,
    style?: string,
    title?: string | null,

    href?: string | null,
    target?: string | null,
    src?: string | null,

    type?: ('input' | 'checkbox' | 'submit' | 'button') | null,
    value?: string | null,

    events?: EventAttributes
    bool?: BooleanAttributes,
    data?: Record<string, string>
}

export interface EventAttributes {
    click?: EventListener,
    mouseover?: EventListener,
    mouseout?: EventListener,
    mouseenter?: EventListener,
    mouseleave?: EventListener,
}
export interface BooleanAttributes {
    disabled?: boolean,
    selected?: boolean,
}


/**
* Get element of ID
* @param {string} e - Element ID
* @param {T} T - Override return type of element, defaults to HTMLElement
* @returns {HTMLElement} - Element
* @throws {Error} - Throws error if not found.
*/
export function $<T = HTMLElement>(e: string) : T {
	let element = $OrNull(e);
	if (!element) {
		throw new Error(`${e} not found`);
	}
	return element as T;
}

/**
* Get element of ID
* @param {string} e - Element ID
* @param {T} T - Override return type of element, defaults to HTMLElement
* @returns {HTMLElement | null} - Element or null if no elements of class exist
*/
export function $OrNull<T = HTMLElement>(e: string) : T | null {
	let element = document.getElementById(e);
	if (!element) {
		return null
	}
	return element as T;
}

/**
* Get first element with class name
* @param {string} className - Class Name
* @param {string} within - Search within element with this ID
* @param {T} T - Override return type of element, defaults to HTMLElement
* @throws {Error} - Throws error if no elements of class exist
* @returns {HTMLElement} - Element
*/
export function firstOfClass<T = HTMLElement>(className: string, within: string | null = null) : T {
	let element = firstOfClassOrNull(className, within);
	if (!element) {
		throw new Error(`No elements of class name '${className}'`);
	}
	return element as T;
}

/**
* Get first element with class name
* @param {string} className - Class Name
* @param {string} within - Search within element with this ID
* @param {T} T - Override return type of element, defaults to HTMLElement
* @returns {HTMLElement | null} - Element or null if no elements of class exist
*/
export function firstOfClassOrNull<T = HTMLElement>(className: string, within: string | null = null) : T | null {
	let elements = (within ? $(within) : document).getElementsByClassName(className);
	if (elements.length < 1) {
		return null;
	}
	return elements[0] as T;
}


declare global { interface HTMLElement {
    /**
    * Append a new element to the receiver
    * @param {string} htmlElementName - HTMLElement type, for example use `new HTMLDivElement`
    * @param {ElementAttributes} attributes - Attribute name and values
    * @returns {HTMLElement} - Newly created element
    */
    appendElement(htmlElementName: string): HTMLElement;
    appendElement(htmlElementName: string, attributes: ElementAttributes | null): HTMLElement;
} }
HTMLElement.prototype.appendElement = function (htmlElementName: string, attributes: ElementAttributes | null = null): HTMLElement {
    return this.appendChild(makeElement(htmlElementName, attributes));
}

declare global { interface HTMLElement {
    /**
    * Insert a new element into to the receivers parent, before the reciever
    * @param {string} htmlElementName - HTMLElement type, for example use `new HTMLDivElement`
    * @param {ElementAttributes} attributes - Attribute name and values
    * @returns {HTMLElement} - Newly created element
    */
    insertElementBefore(htmlElementName: string): HTMLElement | null;
    insertElementBefore(htmlElementName: string, attributes: ElementAttributes | null): HTMLElement | null;
} }
HTMLElement.prototype.insertElementBefore = function (htmlElementName: string, attributes: ElementAttributes | null = null): HTMLElement | null {
    if (this.parentNode) {
        return this.parentNode.insertBefore(makeElement(htmlElementName, attributes), this);
    }
    return null;
}

declare global { interface HTMLElement {
    /**
    * Insert a new element into to the receivers parent, after the reciever
    * @param {string} htmlElementName - HTMLElement type, for example use `new HTMLDivElement`
    * @param {ElementAttributes} attributes - Attribute name and values
    * @returns {HTMLElement} - Newly created element
    */
    insertElementAfter(htmlElementName: string): HTMLElement | null;
    insertElementAfter(htmlElementName: string, attributes: ElementAttributes | null): HTMLElement | null;
} }
HTMLElement.prototype.insertElementAfter = function (htmlElementName: string, attributes: ElementAttributes | null = null): HTMLElement | null {
    if (this.parentNode) {
        return this.parentNode.insertBefore(makeElement(htmlElementName, attributes), this.nextSibling);
    }
    return null;
}

declare global { interface HTMLElement {
    /**
    * Remove receiver from the DOM
    */
    removeElement(): void;
} }
HTMLElement.prototype.removeElement = function (): void {
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }
}


declare global { interface HTMLElement {
    /**
    * Make new HTML Element
    * @param {string} htmlElementName - HTMLElement type, for example use `new HTMLDivElement`
    * @param {ElementAttributes} attributes - Attribute name and values
    * @returns {HTMLElement} - The element
    */
    makeElement(htmlElementName: string): HTMLElement;
    makeElement(htmlElementName: string, attributes: ElementAttributes | null): HTMLElement;
} }
export function makeElement(htmlElementName: string, attributes: ElementAttributes | null = null): HTMLElement {
    var e = document.createElement(htmlElementName);
    for (let a in attributes) {
        if (a == 'events') {
            let events = (attributes as Record<'events', Record<string, EventListener>>).events;
            for (let v in events) {
                e.addEventListener(v, (e: Event) => events[v](e));
            }
        } else if (a == 'bool') {
            let bools = (attributes as Record<'bool', Record<string, boolean>>).bool;
            for (let b in bools) {
                if (bools[b] == true) {
                    e.setAttribute(b, b);
                }
            }
        } else if (a == 'data') {
            let datas = (attributes as Record<'data', Record<string, string>>).data;
            for (let d in datas) {
                e.setAttribute(a + '-' + d, datas[d]);
            }
        } else {
            let string = (attributes as Record<string, string>)[a];
            if (a == 'html') {
                e.innerHTML = string;
            } else {
                e.setAttribute(a, string);
            }
        }
    }
    return e;
}


declare global { interface HTMLElement {
    /**
    * Find first parent in tree of type
    * @param {string} nodeName - Name of new node or tag (e.g. div)
    * @returns {HTMLElement} - Matching parent or null
    */
    parentOfType(nodeName: string): HTMLElement | null;
} }
HTMLElement.prototype.parentOfType = function (nodeName: string): HTMLElement | null {
    var e = this;
    while (e.parentElement) {
        e = e.parentElement;
        if (e.nodeName && e.nodeName.toLowerCase() == nodeName.toLowerCase()) {
            return e;
        }
    }
    return null;
}

declare global { interface HTMLElement {
    /**
    * Find first parent in tree with matching id
    * @param {string} id - Id of element
    * @returns {HTMLElement} - Matching parent or null
    */
    parentOfId(id: string): HTMLElement | null;
} }
HTMLElement.prototype.parentOfId = function (id: string): HTMLElement | null {
    var e = this;
    while (e.parentElement) {
        e = e.parentElement;
        if (e.id && e.id == id) {
            return e;
        }
    }
    return null;
}

declare global { interface HTMLElement {
    /**
    * Find first parent in tree with matching class
    * @param {string} nodeName - Class name of element
    * @returns {HTMLElement} - Matching parent or null
    */
    parentOfClass(className: string): HTMLElement | null;
} }
HTMLElement.prototype.parentOfClass = function (className: string): HTMLElement | null {
    var e = this;
    while (e.parentElement) {
        e = e.parentElement;
        if (e.className && e.containsClass(className)) {
            return e;
        }
    }
    return null;
}


declare global { interface HTMLElement {
    /**
    * Add class name to receiver, unless exists
    * @param {string} newClass - New class name
    * @returns {boolean} - Was successful
    */
    addClass(newClass: string): boolean;
} }
HTMLElement.prototype.addClass = function (newClass: string): boolean {
    if (!this.containsClass(newClass)) {
        this.className += ((this.className != '') ? ' ' : '') + newClass;
        return true;
    }
    return false;
}

declare global { interface HTMLElement {
    /**
     * Removed a class name from the reciver if it exists
     * @param {string} oldClass - Class name to remove
     * @returns {boolean} - Was successful
    */
   removeClass(oldClass: string): boolean;
} }
HTMLElement.prototype.removeClass = function (oldClass: string): boolean {
    if (this.className != undefined) {
        this.className = (' ' + this.className + ' ').replace(' ' + oldClass + ' ', ' ');
        if (this.className.trim == undefined) {
            this.className = this.className.replace(/^\s+|\s+$/g, '');
        } else {
            this.className = this.className.trim();
        }
        return true;
    }
    return false;
}

declare global { interface HTMLElement {
    /**
     * Adds class name if not present, or removes the class name if it is present
     * @param {string} className - Class name to toggle
    */
   toggleClass(className: string): void;
} }
HTMLElement.prototype.toggleClass = function (className: string): void {
    if (this.containsClass(className)) {
        this.removeClass(className);
    } else {
        this.addClass(className);
    }
}

declare global { interface HTMLElement {
    /**
     * Adds class name if not present, or removes the class name if it is present
     * @param {string} className - Class name to toggle
     * @returns {boolean} - Was successful
    */
   swapClass(oldClassName: string, newClassName: string): boolean;
} }
HTMLElement.prototype.swapClass = function (oldClassName: string , newClassName: string): boolean {
    if (this.containsClass(oldClassName)) {
        return this.removeClass(oldClassName) && this.addClass(newClassName);
    }
    return false;
}

declare global { interface HTMLElement {
    /**
     * Checks if element has class name
     * @param {string} className - Class name to check for
     * @param {boolean} on - Add class if true, remove if false
    */
   toggleClassIfTrue(className: string, on: boolean): void;
} }
HTMLElement.prototype.toggleClassIfTrue = function (className: string, on: boolean): void {
    if (on) {
        this.addClass(className);
    } else {
        this.removeClass(className)
    }
}

declare global { interface HTMLElement {
    /**
     * Checks if element has class name
     * @param {string} className - Class name to check for
     * @returns {boolean} - True if element contains class, otherwise false
    */
   containsClass(className: string): boolean;
} }
HTMLElement.prototype.containsClass = function (className: string): boolean {
    return (' ' + this.className + ' ').indexOf(' ' + className + ' ') >= 0
}


declare global { interface HTMLElement {
    /**
    * Empty inner html
    * @returns {boolean} - True if element contains class, otherwise false
    */
    empty(): void;
} }
HTMLElement.prototype.empty = function (): void {
    this.innerHTML = '';
}

declare global { interface HTMLElement {
    /**
     * Set or Get inner html
     * @param {string | null} html - Html to set, or null if getting
     * @returns {string} - The innner html
    */
   html(html: string | null): string;
   html(): string
} }
HTMLElement.prototype.html = function (html: string | null = null): string {
    if (html != null) {
        this.innerHTML = html;
    }
    return this.innerHTML;
}


declare global { interface HTMLFormElement {
    /**
    * Convert form elements to name=value pairs string
    * @returns {string} - '' if no elements
    */
   toUrlString(): string;
} }
HTMLFormElement.prototype.toUrlString = function (): string {
	let string = '';
	for (let i = 0; i < this.elements.length; i++) {
		if (string != '') { string += '&'; }
        let element = this.elements[i] as HTMLInputElement;
		if (element.name) {
			string += element.name + '=' + encodeURIComponent(element.value);
		}
	}
	return string;
}

declare global { interface HTMLFormElement {
    /**
    * Convert form elements and values to json object
    * @returns {object} - {} if no elements
    */
    toJson<T>(): T;
} }
HTMLFormElement.prototype.toJson = function<T>(): T {
	var obj: Record<string, string> = {};
 	for (var i = 0; i < this.elements.length; i++) {
 		let element = this.elements[i] as HTMLInputElement;
 		if (element.name) {
 			var val: any = element.value;
 			if (val == '' && this.elements[i].getAttribute('data-nullonempty') == 'true') {
 				val = null;
 			} else if (this.elements[i].getAttribute('data-type') == 'int') {
 				val = parseInt(val);
 			} else if (this.elements[i].getAttribute('data-type') == 'float') {
 				val = parseFloat(val);
 			} else if (this.elements[i].getAttribute('data-type') == 'bool') {
 				val = val.toLowerCase() == 'true';
 			}
 			if (element.type == 'checkbox') {
 				val = element.checked;
 			}
 			obj[element.name] = val;
 		}
 	}
 	return obj as T;
}