//********************************************************************//
//********************************************************************//
//**																**//
//**	dateFormat.js         			 							**//
//**	JavaScript based date formating methods (based on PHP)		**//					//does not support e or T
//**    	      					  	  							**//
//** 	Doucmentation at software.ben-robinson.com					**//
//**    	      					  	  							**//
//**    	      					  	  							**//
//**	Copywrite 2007 ben-robinson.com								**//
//**	Your are free you use and modify this as you like, 			**//
//**	please do not distribute modified versions with out			**//
//**	express permission (contact via ben-robinson.com)			**//
//**																**//
//**	This code is provided AS IS with no warranties. 			**//
//**	I am in no way responsible for any loss caused 				**//
//**	by failure of this code.									**//
//**																**//
//**																**//
//********************************************************************//
//********************************************************************//

declare global { interface Date {
	/**
	* Format date object using PHP style format codes
	* @param {string} format - PHP style format code
	* @returns {string} - Formatted date
	*/
	format(format: string): string;
} }
Date.prototype.format = function (format: string): string {
    return new DateFormat(this).format(format);
}

declare global { interface Date {
	getDayOfYear(): number;
} }
Date.prototype.getDayOfYear = function(): number {
	return (this.valueOf() - new Date(this.getFullYear() + '/1/1').valueOf()) / 86400000;
}

declare global { interface Date {
	isLeapYear(): boolean;
} }
Date.prototype.isLeapYear = function(): boolean {
	return new Date(this.getFullYear(), 1, 29).getMonth() == 1;
}

declare global { interface Date {
	getTimezoneOffsetFormatted(colon: boolean): string;
} }
Date.prototype.getTimezoneOffsetFormatted = function(colon: boolean): string {
	var s = '-';
	var m = this.getTimezoneOffset().toString();
	if (m.slice(0,1) == '-') {
		s='+';
		m=m.slice(1,99)
	}
	var h = Math.floor(parseInt(m)/60);
	var mNum = parseFloat(m) % 60;
	
	if (h == 0 && mNum == 0) { s = '+'; }
	
	var returnStr: string;
	returnStr = s + h.fix2Digits();
	if(colon) returnStr += ':'
	returnStr += mNum.fix2Digits();
	return returnStr
}


declare global { interface Date {
	getISODay(): number;
} }
Date.prototype.getISODay = function(): number {
	var ISODay = this.getDay();
	if (ISODay==0) ISODay=7;
	return ISODay;
}


declare global { interface Date {
	getISODate(): { year: number, week: string, day: number};
} }
Date.prototype.getISODate = function(): { year: number, week: string, day: number} {
	var yr = this.getFullYear();
	var dyNo = this.getDayOfYear()+1;
	var jan1Dy = new Date(this.getFullYear() + '/01/01').getISODay();
	var ISOdy = this.getISODay();
	var ISOyr, ISOwk;
	
	if (dyNo <= 8-jan1Dy && jan1Dy > 4) {
		ISOyr = yr-1;
		ISOwk = (jan1Dy==5 || (jan1Dy==6 && new Date((yr-1) + '/1/1').isLeapYear())) ? 53 : 52
	} else {
		ISOyr = yr;
	}
	if (ISOyr == yr) {
		var dys = (this.isLeapYear()) ? 366 : 365;
		if (dys-dyNo < 4-ISOdy) {
			ISOyr = yr+1
			ISOwk = 1
		}
	}
	if (ISOyr == yr) {
		ISOwk = (dyNo + (7 - ISOdy) + (jan1Dy - 1)) / 7;
		if (jan1Dy > 4) ISOwk -= 1;
	}
	
	return { year: ISOyr, week: ISOwk?.fix2Digits() || '', day: ISOdy }
}


declare global { interface Date {
	getBeats(): string;
} }
Date.prototype.getBeats = function(): string {
	let b = (this.getSeconds() + (this.getMinutes() * 60) + (this.getHours() * 3600)) / 86.4;
	let bStr = b.fix2Digits();
	if (b < 100) { bStr = '0' + bStr; }
	return bStr;
}


declare global { interface Date {
	inDaylightSaving(): number;
} }
Date.prototype.inDaylightSaving = function(): number {
	var ds = this.getDaylightSavingChangeDate();
	var s=ds.start;
	var e=ds.end;
	
	if (s === null || e === null) {
		return -1;
	}
	
	if (s.valueOf() < e.valueOf()) {
		return (this.valueOf() > s.valueOf() && this.valueOf() < e.valueOf()) ? 1 : 0;
	} else {
		return (this.valueOf() > e.valueOf() && this.valueOf() < s.valueOf()) ? 0 : 1;
	}
}


declare global { interface Date {
	getDaylightSavingChangeDate(): { start: Date | null, end: Date | null };
} }
Date.prototype.getDaylightSavingChangeDate = function(): { start: Date | null, end: Date | null } {
	
	var testDate = new Date(this.getFullYear() + '/02/01 00:00:00');
	
	var d1: Date | null = null;
	var d2: Date | null = null;
	var chgDir1 = 1;
	var chgDir2 = 1;
	
	var lastTZO;
	
	while (testDate.getMonth() < 11) {
		var preDate = new Date(testDate.valueOf());
		lastTZO = testDate.getTimezoneOffset();
		testDate.setHours(testDate.getHours()+1,0,0,0);
		if(lastTZO != testDate.getTimezoneOffset() || preDate.valueOf()==testDate.valueOf()) {
			if (d1 === null) {
				d1 = new Date(testDate.valueOf());
				if(preDate.getTimezoneOffset()<testDate.getTimezoneOffset()) chgDir1=0;
				testDate.setMonth(8);
			} else {
				d2 = new Date(testDate.valueOf());
				if(preDate.getTimezoneOffset() < testDate.getTimezoneOffset()) {
					chgDir2 = 0;
				}
			}
			
		}
		if(preDate.valueOf()==testDate.valueOf()) testDate.setHours(testDate.getHours()+2,0,0,0);
		
		if (testDate.getMonth() == 4) testDate.setMonth(8)
	}
	
	let s: Date | null, e: Date | null;
	if (chgDir1 == 1) {
		s = d1;
		e = d2;
	} else { 
		s = d2;
		e = d1;
	}

	return { start: s, end: e };
}


declare global { interface Date {
	asValueWithNoTime(): number
} }
Date.prototype.asValueWithNoTime = function(): number {
	return new Date(this).setHours(0, 0, 0, 0);
}



declare global { interface String {
	asDate(): Date
} }
String.prototype.asDate = function(): Date {
	return new Date(this as string);
}

declare global { interface String {
	asDateValue(): number
} }
String.prototype.asDateValueWithNoTime = function(): number {
	return this.asDate().asValueWithNoTime();
}

declare global { interface String {
	asDateValueWithNoTime(): number
} }
String.prototype.asDateValue = function(): number {
	return this.asDate().valueOf();
}


declare global { interface Number {
	fix2Digits(): string
} }
Number.prototype.fix2Digits = function(): string {
	let fixed = this.toString();
	if (this.valueOf() < 10) { fixed = '0' + fixed; }
	return fixed;
}


export class DateFormat {
	
	monthNames = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
	dayNames = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
	monthDays = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

	date: Date = new Date();

	constructor(date: Date) {
		this.date = date;
	}

	format(format: string): string {

		let formatedDate = '';
		let skipNext = false;
		for (let i = 0; i < format.length; i ++) {
			if (skipNext) { formatedDate += format.charAt(i); skipNext = false;
			} else if (format.charAt(i)=='$') { skipNext = true;
			} else if (format.charAt(i)=='d') { formatedDate += this.date.getDate().fix2Digits();
			} else if (format.charAt(i)=='D') { formatedDate += this.dayNames[this.date.getDay()].slice(0,3);
			} else if (format.charAt(i)=='j') { formatedDate += this.date.getDate();
			} else if (format.charAt(i)=='l') { formatedDate += this.dayNames[this.date.getDay()];
			} else if (format.charAt(i)=='N') { formatedDate += this.date.getISODay();
			} else if (format.charAt(i)=='S') { formatedDate += this.getEnglishOrdinal(this.date.getDate());
			} else if (format.charAt(i)=='w') { formatedDate += this.date.getDay();
			} else if (format.charAt(i)=='z') { formatedDate += this.date.getDayOfYear();
			} else if (format.charAt(i)=='W') { formatedDate += this.date.getISODate().week;
			} else if (format.charAt(i)=='F') { formatedDate += this.monthNames[this.date.getMonth()];
			} else if (format.charAt(i)=='m') { formatedDate += (this.date.getMonth() + 1).fix2Digits();
			} else if (format.charAt(i)=='M') { formatedDate += this.monthNames[this.date.getMonth()].slice(0,3);
			} else if (format.charAt(i)=='n') { formatedDate += this.date.getMonth()+1;
			} else if (format.charAt(i)=='t') { formatedDate += (this.date.getMonth()==1 && this.date.isLeapYear()) ? 29 : this.monthDays[this.date.getMonth()];
			} else if (format.charAt(i)=='L') { formatedDate += (this.date.isLeapYear()) ? 1 : 0;
			} else if (format.charAt(i)=='o') { formatedDate += this.date.getISODate().year;
			} else if (format.charAt(i)=='Y') { formatedDate += this.date.getFullYear();
			} else if (format.charAt(i)=='y') { formatedDate += this.date.getFullYear().toString().slice(2);
			} else if (format.charAt(i)=='a') { formatedDate += (this.date.getHours()>12) ? 'pm' : 'am';
			} else if (format.charAt(i)=='A') { formatedDate += (this.date.getHours()>12) ? 'PM' : 'AM';
			} else if (format.charAt(i)=='B') { formatedDate += this.date.getBeats();
			} else if (format.charAt(i)=='g') { formatedDate += (this.date.getHours()>12) ? this.date.getHours()-12 : this.date.getHours();
			} else if (format.charAt(i)=='G') { formatedDate += this.date.getHours();
			} else if (format.charAt(i)=='h') { formatedDate += ((this.date.getHours()>12) ? this.date.getHours()-12 : this.date.getHours()).fix2Digits();
			} else if (format.charAt(i)=='H') { formatedDate += this.date.getHours().fix2Digits();
			} else if (format.charAt(i)=='i') { formatedDate += this.date.getMinutes().fix2Digits();
			} else if (format.charAt(i)=='s') { formatedDate += this.date.getSeconds().fix2Digits();
			//} else if (format.charAt(i)=='e') { formatedDate += '';	//???
			} else if (format.charAt(i)=='I') { formatedDate += (this.date.inDaylightSaving()==1) ? 1 : 0;
			} else if (format.charAt(i)=='O') { formatedDate += this.date.getTimezoneOffsetFormatted(false);
			} else if (format.charAt(i)=='P') { formatedDate += this.date.getTimezoneOffsetFormatted(true);
			//} else if { (format.charAt(i)=='T') { formatedDate += '';	//???
			} else if (format.charAt(i)=='Z') { formatedDate += this.date.getTimezoneOffset()*60;
			} else if (format.charAt(i)=='U') { formatedDate += Math.round(this.date.valueOf() / 1000);
			} else if (format.charAt(i)=='c') { formatedDate += this.date.getFullYear() + '-' + (this.date.getMonth() + 1).fix2Digits() + '-' + this.date.getDate().fix2Digits() + 'T' + this.date.getHours().fix2Digits() + ':' + this.date.getMinutes().fix2Digits() + ':' + this.date.getSeconds().fix2Digits() + this.date.getTimezoneOffsetFormatted(true);
			} else if (format.charAt(i)=='r') { formatedDate += this.dayNames[this.date.getDay()].slice(0,3) + ', ' + this.date.getDate() + ' ' + this.monthNames[this.date.getMonth()].slice(0,3) + ' ' + this.date.getFullYear() + ' ' + this.date.getHours().fix2Digits() + ':' + this.date.getMinutes().fix2Digits() + ':' + this.date.getSeconds().fix2Digits() + ' ' + this.date.getTimezoneOffsetFormatted(false);
			} else { formatedDate += format.charAt(i);
			}
		}
		
		return formatedDate		
	}
	
	private getEnglishOrdinal(n: number): string {
		let eo: string;
		let d = n.toString();
		if (d.charAt(d.length-1) == '1' && (d.charAt(0) != '1' || d.length == 1)) {
			eo = 'st';
		} else if (d.charAt(d.length-1) == '2' && (d.charAt(0) != '1' || d.length == 1)) { 
			eo = 'nd';
		} else if (d.charAt(d.length-1) == '3' && (d.charAt(0) != '1' || d.length == 1)) { 
			eo = 'rd'; 
		} else { 
			eo = 'th'; 
		}
		return eo;
	}
}