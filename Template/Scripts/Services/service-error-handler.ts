export class ServiceErrorHandler {
    
    showError(message: string | null): void {

        alert(message ?? 'An unknown error occurred');

    }
}
