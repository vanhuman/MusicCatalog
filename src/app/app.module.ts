import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { MusicCatalogComponent } from './music-catalog/music-catalog.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './music-catalog/components/header/header.component';
import { OverviewComponent } from './music-catalog/components/overview/overview.component';
import { AuthenticationService } from './music-catalog/services/authentication.service';
import { ApiRequestService } from './music-catalog/services/api-request.service';
import { CustomModalComponent } from './music-catalog/modals/custom-modal.component';
import { ModalService } from './music-catalog/modals/modal.service';
import { LoginComponent } from './music-catalog/components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    declarations: [
        MusicCatalogComponent,
        HeaderComponent,
        OverviewComponent,
        CustomModalComponent,
        LoginComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [
        HttpClient,
        AuthenticationService,
        ApiRequestService,
        ModalService,
    ],
    bootstrap: [MusicCatalogComponent]
})
export class AppModule {
}
