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
import { ModalService } from './music-catalog/services/modal.service';
import { LoginComponent } from './music-catalog/components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiRequestServiceInterface } from './music-catalog/services/api-request.service.interface';
import { AuthenticationServiceInterface } from './music-catalog/services/authentication.service.interface';
import { ModalServiceInterface } from './music-catalog/services/modal.service.interface';
import { AlbumsFactoryInterface } from './music-catalog/factories/albums.factory.interface';
import { AlbumsFactory } from './music-catalog/factories/albums.factory';
import { AlbumComponent } from './music-catalog/components/overview/album/album.component';

@NgModule({
    declarations: [
        MusicCatalogComponent,
        HeaderComponent,
        OverviewComponent,
        CustomModalComponent,
        LoginComponent,
        AlbumComponent,
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
        { provide: ModalServiceInterface, useClass: ModalService },
        { provide: AuthenticationServiceInterface, useClass: AuthenticationService },
        { provide: ApiRequestServiceInterface, useClass: ApiRequestService },
        { provide: AlbumsFactoryInterface, useClass: AlbumsFactory }
    ],
    bootstrap: [MusicCatalogComponent]
})
export class AppModule {
}
