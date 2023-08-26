
export interface Box {
    top: number,
    left: number,
    bottom: number,
    right: number,
}


/**
* Get size of window area
* @returns {object} - {w, h} containing width and height
*/
export function windowSize(): { w: number, h: number } {
    return {
        w: window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth,
        h: window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight
    };
}

declare global { interface HTMLElement {
    /**
    * Get receivers position; unlike getBoundingClientRect returns distance from nearest edge, i.e. right is distance from right edge (not left edge)
    * @param {HTMLElement} relativeTo - Relative element to provide edges for the receiver
    * @returns {object} - {top, left, bottom, right}
    */
    getPosition(relativeTo: HTMLElement): Box;
    getPosition(): Box;
} }
HTMLElement.prototype.getPosition = function (relativeTo: HTMLElement | null = null): Box {
    var win = windowSize();
    var boundingBox = this.getBoundingClientRect();
    var relativeBox = relativeTo ? relativeTo.getPosition() : { top: 0, left: 0, bottom: 0, right: 0 };
    return {
        top: Math.floor(boundingBox.top - relativeBox.top),
        left: Math.floor(boundingBox.left - relativeBox.left),
        bottom: Math.floor(win.h - boundingBox.bottom - relativeBox.bottom),
        right: Math.floor(win.w - boundingBox.right - relativeBox.right)
    }
}