export interface KeyHandling {
    keyStroke: KeyCode;
    function: any;
}

export type KeyCode = 'Enter' | 'Escape';

export class KeyStrokeUtility {
    private static keyHandlingFunction: any;

    public static addListener(keyHandlings: KeyHandling[]): void {
        this.keyHandlingFunction = (event: KeyboardEvent) => {
            const matchingKeyHandling = keyHandlings.find(keyHandling => keyHandling.keyStroke === event.key);
            if (matchingKeyHandling) {
                matchingKeyHandling.function(event);
            }
        };
        window.document.addEventListener('keydown', this.keyHandlingFunction);
    }

    public static removeListener(): void {
        window.document.removeEventListener('keydown', this.keyHandlingFunction);
    }
}
