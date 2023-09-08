﻿import { Template } from '../../Scripts/Site'
import { $ } from '../../Scripts/BRLibraries/DOM'

export class HomeIndex {

    site: Template;

    constructor(site: Template, data: any | null) {

        this.site = site;

    }

    buttonClick(event: Event) {
        alert('Button Clicked\n\n' + event)
    }
    
}