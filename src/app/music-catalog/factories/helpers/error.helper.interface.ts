import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';

export abstract class ErrorHelperInterface {
    public abstract errorHandling(error: HttpErrorResponse, observable: Subject<any>): void;
}
