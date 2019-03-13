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
import { AlbumsFactoryInterface } from './music-catalog/factories/albums/albums.factory.interface';
import { AlbumsFactory } from './music-catalog/factories/albums/albums.factory';
import { AlbumComponent } from './music-catalog/components/overview/album/album.component';
import { TooltipComponent } from './music-catalog/directives/tooltip/tooltip.component';
import { TooltipDirective } from './music-catalog/directives/tooltip/tooltip.directive';
import { TooltipContainerComponent } from './music-catalog/directives/tooltip/tooltip-container';
import { TooltipService } from './music-catalog/services/tooltipService';
import { AlbumsFactoryState } from './music-catalog/factories/albums/albums.factory.state';
import { AlbumEditComponent } from './music-catalog/components/detail/album-edit.component';
import { ArtistsFactoryInterface } from './music-catalog/factories/artists/artists.factory.interface';
import { ArtistsFactory } from './music-catalog/factories/artists/artists.factory';
import { ArtistsFactoryState } from './music-catalog/factories/artists/artists.factory.state';
import { FormCloseService } from './music-catalog/services/form-close.service';
import { FormatsFactoryInterface } from './music-catalog/factories/formats/formats.factory.interface';
import { FormatsFactory } from './music-catalog/factories/formats/formats.factory';
import { FormatsFactoryState } from './music-catalog/factories/formats/formats.factory.state';
import { LabelsFactoryInterface } from './music-catalog/factories/labels/labels.factory.interface';
import { LabelsFactory } from './music-catalog/factories/labels/labels.factory';
import { LabelsFactoryState } from './music-catalog/factories/labels/labels.factory.state';

@NgModule({
    declarations: [
        MusicCatalogComponent,
        HeaderComponent,
        OverviewComponent,
        CustomModalComponent,
        LoginComponent,
        AlbumComponent,
        TooltipComponent,
        TooltipDirective,
        TooltipContainerComponent,
        AlbumEditComponent,
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
        TooltipService,
        AlbumsFactoryState,
        ArtistsFactoryState,
        FormatsFactoryState,
        LabelsFactoryState,
        FormCloseService,
        { provide: ModalServiceInterface, useClass: ModalService },
        { provide: AuthenticationServiceInterface, useClass: AuthenticationService },
        { provide: ApiRequestServiceInterface, useClass: ApiRequestService },
        { provide: AlbumsFactoryInterface, useClass: AlbumsFactory },
        { provide: ArtistsFactoryInterface, useClass: ArtistsFactory },
        { provide: FormatsFactoryInterface, useClass: FormatsFactory },
        { provide: LabelsFactoryInterface, useClass: LabelsFactory },
    ],
    bootstrap: [MusicCatalogComponent]
})
export class AppModule {
}
