/**
* Display a message on the screen
* @param {string} message - Message to display
*/
export function showMessage(message: string, type: AlertType = AlertType.Plain) : void {

	let div = document.getElementById('__flash_message')
	if (!div) {
		div = document.createElement('div');
		div.id = '__flash_message';
		div.style.position = 'fixed';
		div.style.top = '30px';
		div.style.left = '50%';
		div.style.transform = 'translateX(-50%)';
		div.style.maxWidth = '500px'
		div.style.border = '1px solid black';
		div.style.borderRadius = '5px';
		div.style.padding = '1rem';
		div.style.zIndex = '999999';
		document.body.appendChild(div)
	}

	if (type == AlertType.Plain) {
		div.style.backgroundColor = 'white';
		div.style.color = div.style.borderColor = 'black';
	}
	else if (type == AlertType.Success) {
		div.style.backgroundColor = 'rgb(230, 255, 230)';
		div.style.color = div.style.borderColor = 'darkgreen';
	}
	else if (type == AlertType.Fail) {
		div.style.backgroundColor = 'rgb(255, 230, 230)';
		div.style.color = div.style.borderColor = 'darkred';
	}
	
	div.innerHTML = message;
	div.style.display = 'block';
}

/**
* Display a message on the screen
* @param {string} message - Message to display
*/
export function closeMessage() : void {
	let div = document.getElementById('__flash_message');
	if (div) {
		div.style.display = 'none';
	}	
}
	
/**
* Display a message breifly on the screen
* @param {string} message - Message to display
*/
export function flashMessage(message: string, type: AlertType = AlertType.Plain) : void {
	showMessage(message, type);
	setTimeout(() => {
		closeMessage()
	}, 1500);
}

export enum AlertType {
	Plain,
	Success,
	Fail
}