import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthenticationResult } from '../../services/authentication.service';
import { KeyCode, KeyStrokeUtility } from '../../utilities/key-stroke.utility';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';

@Component({
    selector: 'music-catalog-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
    @Output() loggedIn: EventEmitter<boolean> = new EventEmitter<boolean>();

    public loginForm = new FormGroup({
        username: new FormControl(),
        password: new FormControl(),
    });
    public id = 'music-catalog-login';
    public error;

    private element: any;
    private loggingIn = false;
    private authenticationSubscription: Subscription;

    public constructor(
        private el: ElementRef,
        private authenticationService: AuthenticationServiceInterface,
    ) {
        this.element = el.nativeElement;
    }

    public ngOnInit(): void {
        const login = this;
        this.element.addEventListener('click', function (el: any) {
            if (el.target.className === 'login'
                || el.target.className === 'login-background') {
                login.cancel();
            }
        });
        const keyHandlings = [
            {
                keyStroke: <KeyCode>'Enter',
                function: () => this.login.apply(this),
            },
            {
                keyStroke: <KeyCode>'Escape',
                function: () => this.cancel.apply(this),
            },
        ];
        KeyStrokeUtility.addListener(keyHandlings);
    }

    public ngOnDestroy(): void {
        if (this.authenticationSubscription) {
            this.authenticationSubscription.unsubscribe();
        }
        KeyStrokeUtility.removeListener();
    }

    public cancel(): void {
        this.loggedIn.emit(false);
    }

    public login(): void {
        if (!this.loggingIn) {
            this.loggingIn = true;
            const username = this.loginForm.controls['username'].value;
            const password = this.loginForm.controls['password'].value;
            this.authenticationSubscription = this.authenticationService.login(username, password, true)
                .subscribe((loginResult: AuthenticationResult) => {
                    if (loginResult.succes) {
                        this.loggedIn.emit(true);
                    } else {
                        this.error = loginResult.error;
                    }
                    this.loggingIn = false;
                });
        }
    }
}
