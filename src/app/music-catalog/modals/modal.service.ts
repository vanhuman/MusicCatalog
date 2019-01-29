import { CustomModalComponent } from './custom-modal.component';

export class ModalService {
    private modals: CustomModalComponent[] = [];

    public add(modal: CustomModalComponent) {
        this.modals.push(modal);
    }

    public remove(id: string) {
        this.modals = this.modals.filter(m => m.id !== id);
    }

    public getModal(id: string): CustomModalComponent {
        return this.modals.filter(m => m.id === id)[0];
    }
}
