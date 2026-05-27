import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ErrorApiResponseWrapper } from '../../models/api-responses/error-api-response.interface';

export abstract class ErrorHelperInterface {
    public abstract errorHandling(error: HttpErrorResponse | ErrorApiResponseWrapper, observable: Subject<any>): void;
}
