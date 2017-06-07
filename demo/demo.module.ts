import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { YcjsAdminModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  declarations: [DemoComponent],
  imports: [BrowserModule, YcjsAdminModule.forRoot()],
  bootstrap: [DemoComponent]
})
export class DemoModule {}