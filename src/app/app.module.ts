import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { MusicCatalogComponent } from './music-catalog/music-catalog.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './music-catalog/components/header/header.component';
import { OverviewComponent } from './music-catalog/components/overview/overview.component';
import { AuthenticationService } from './music-catalog/services/authentication.service';
import { ApiRequestService } from './music-catalog/services/api-request.service';

@NgModule({
    declarations: [
        MusicCatalogComponent,
        HeaderComponent,
        OverviewComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
    ],
    providers: [
        HttpClient,
        AuthenticationService,
        ApiRequestService,
    ],
    bootstrap: [MusicCatalogComponent]
})
export class AppModule {
}
