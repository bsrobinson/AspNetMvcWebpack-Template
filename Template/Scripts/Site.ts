import { $ } from './BRLibraries/DOM'
import { TemplateService } from './Services/~csharpe-services';

export class Template {

    api = new TemplateService.APIDemoController()

    constructor() {

        this.api.post({ start: 5, count: 10 }).then(response => {
            if (response.data) {
                console.log('API Demo', response.data);
            }
        });
        
    }

    navClicked(event: Event) {
        console.log('Navigation Clicked', event);
    }
    
}