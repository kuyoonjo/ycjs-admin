import { NgModule, ModuleWithProviders } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { YcjsAdminCRUDComponent } from './component';
import {
    InputTextModule,
    ButtonModule,
    DataTableModule,
    PaginatorModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    GrowlModule,
    ToolbarModule,
    MultiSelectModule,
    CalendarModule,
    SliderModule,
    ChipsModule
} from 'primeng/primeng';

@NgModule({
    declarations: [
        YcjsAdminCRUDComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        DataTableModule,
        PaginatorModule,
        DialogModule,
        ConfirmDialogModule,
        DropdownModule,
        GrowlModule,
        ToolbarModule,
        MultiSelectModule,
        CalendarModule,
        SliderModule,
        ChipsModule
    ],
    exports: [
        YcjsAdminCRUDComponent
    ]
})
export class YcjsAdminCRUDModule {

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: YcjsAdminCRUDModule
        };
    }
}
