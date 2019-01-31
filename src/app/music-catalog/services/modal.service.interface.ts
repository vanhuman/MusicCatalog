import { CustomModalComponent } from '../modals/custom-modal.component';

export abstract class ModalServiceInterface {

    public abstract add(modal: CustomModalComponent);

    public abstract remove(id: string);

    public abstract getModal(id: string): CustomModalComponent;
}
