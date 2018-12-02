import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { MediaManagerComponent } from './media-manager/media-manager.component';

@NgModule({
  declarations: [
    MediaManagerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [MediaManagerComponent]
})
export class AppModule { }
