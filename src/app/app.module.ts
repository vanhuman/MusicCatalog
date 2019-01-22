import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { MusicCatalogComponent } from './music-catalog/music-catalog.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [
        MusicCatalogComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
    ],
    providers: [
        HttpClient,
    ],
    bootstrap: [MusicCatalogComponent]
})
export class AppModule {
}
