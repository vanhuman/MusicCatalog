import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthenticationResult } from '../../services/authentication.service';
import { KeyCode, KeyStrokeUtility } from '../../utilities/key-stroke.utility';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';

@Component({
    selector: 'music-catalog-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
    @Output() loggedInEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

    public loginForm = new FormGroup({
        username: new FormControl(),
        password: new FormControl(),
    });
    public id = 'music-catalog-login';
    public error;

    private element: any;
    private loggingIn = false;

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
                login.close();
            }
        });
        const keyHandlings = [
            {
                keyStroke: <KeyCode>'Enter',
                function: (event) => this.login.apply(this),
            },
            {
                keyStroke: <KeyCode>'Escape',
                function: (event) => this.close.apply(this),
            },
        ];
        KeyStrokeUtility.addListener(keyHandlings);
    }

    public close(): void {
        KeyStrokeUtility.removeListener();
        this.element.style.display = 'none';
    }

    public login(): void {
        if (!this.loggingIn) {
            this.loggingIn = true;
            const username = this.loginForm.controls['username'].value;
            const password = this.loginForm.controls['password'].value;
            this.authenticationService.login(username, password).subscribe((loginResult: AuthenticationResult) => {
                if (loginResult.succes) {
                    this.loggedInEmitter.emit(true);
                    this.close();
                } else {
                    this.error = loginResult.error;
                }
                this.loggingIn = false;
            });
        }
    }
}
