import { Template } from '../../Scripts/Site'
import { $ } from '../../Scripts/BRLibraries/DOM'

export class HomeIndex {

    constructor(private site: Template, private data: any | null) {

    }

    buttonClick(event: Event) {
        alert('Button Clicked\n\n' + event)
    }
    
}