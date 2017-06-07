import { Component, OnInit, Input } from '@angular/core';
import { ConfirmationService, Message, LazyLoadEvent, SelectItem, DataTable } from 'primeng/primeng';
import { YcjsAPI, YcjsRequest, YcjsRequestPaginateData } from '@ycjs/core';
import { YcjsAuth } from '@ycjs/auth';

@Component({
  selector: 'ycjs-admin-crud',
  template: `
  <div *ngIf="data">
  <p-toolbar [style]="{'border-radius': 0, 'border-color': 'black', background: 'black', padding: '16px'}">
    <div class="ui-toolbar-group-left">
      <div style="font-size: 26px; padding-left: 8px; color: white">{{ params.title.list }}</div>
    </div>
    <div class="ui-toolbar-group-right">
      <button *ngFor="let b of params.customButtons" [class]="b.class" type="button" pButton [icon]="b.icon" (click)="b.handler(self)" [label]="b.label"></button>
      <button *ngIf="!params.hideAdd" class="ui-button-success" type="button" pButton icon="fa-plus" (click)="add()" label="添加"></button>
      <button *ngIf="!params.hideExport" type="button" pButton icon="fa-file-o" iconPos="left" label="导出CSV" (click)="exportCSV(dt)"></button>
    </div>
  </p-toolbar>
  <p-dataTable #dt [value]="data.docs" scrollable="true" selectionMode="single" [(selection)]="selected" (onRowSelect)="select($event)"
    [lazy]="true" [rows]="params.rows || 10" [paginator]="true" [totalRecords]="data.total" (onLazyLoad)="loadLazy($event, dt)">
    <p-header>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <p-multiSelect [options]="columnOptions" [(ngModel)]="params.cols"></p-multiSelect>

        <div style="flex: 0 0 200px">
          <div style="padding-bottom: 8px">每页条数：{{ params.rows === 100 ? '全部' : params.rows }}</div>
          <p-slider [(ngModel)]="params.rows" animate="true" [min]="5" (onSlideEnd)="reload()"></p-slider>
        </div>
      </div>
    </p-header>
    <p-column *ngFor="let col of getDisplayCols()" [field]="col.field" [header]="col.header" [style]="col.style" [sortable]="col.sortable" [filter]="col.filter" [filterMatchMode]="col.filter ? col.filter.mode : null">
      <template *ngIf="col.display && col.display.type == 'enum'" let-data="rowData" pTemplate="body">
        <span>{{ col.display.map(data[col.field]) }}</span>
      </template>

      <template *ngIf="col.filter && col.filter.type == 'multiple'" pTemplate="filter">
            <p-multiSelect [options]="col.filter.options" [defaultLabel]="col.filter.placeholder" (onChange)="dt.filter($event.value,col.field,col.filter.mode)" styleClass="ui-column-filter"></p-multiSelect>
        </template>
      <template *ngIf="col.filter && col.filter.type == 'datetime-range'" pTemplate="filter">
          <div style="padding-top: 8px; display: flex; align-items: center; justify-content: center">
            <div>从：</div>
            <p-calendar [defaultDate]="col.filter.fr" 
            selectOtherMonths="true" 
            monthNavigator="true" 
            yearNavigator="true" 
            yearRange="2016:2020"
            [(ngModel)]="col.filter.fr" 
            showTime="showTime" 
            hourFormat="24"
            styleClass="ui-column-filter"></p-calendar>
          </div>
          <div style="display: flex; align-items: center; justify-content: center">
            <div>至：</div>
            <p-calendar [defaultDate]="col.filter.to" 
            selectOtherMonths="true" 
            monthNavigator="true" 
            yearNavigator="true" 
            yearRange="2016:2020"
            [(ngModel)]="col.filter.to" 
            showTime="showTime" 
            hourFormat="24" 
            styleClass="ui-column-filter">
            </p-calendar>
          </div>
          <div style="text-align: center;padding-top: 12px">
            <button class="ui-button-secondary" pButton type="button" label="筛选" (click)="addDatetimeFilterRange(col)"></button>
          </div>
        </template>
    </p-column>

    </p-dataTable>

    <p-dialog [header]="params.title.edit" [(visible)]="showModal" modal="modal" width="800" responsive="true">
      <div style="height: 400px; overflow: scroll">
        <div *ngIf="selected" class="table-responsive">
          <table class="table">
            <tbody>
              <tr *ngFor="let col of getEditorCols()">
                <td style="padding: 16px 16px 16px 8px; white-space: nowrap;">{{ col.header }}</td>
                <td *ngIf="col.editor.type == 'text'" style="width: 100%;"><input [disabled]="col.editor.disabled" style="width: 100%;" pInputText [(ngModel)]="selected[col.field]" /></td>
                <td *ngIf="col.editor.type == 'chip'" style="width: 100%;"><p-chips [(ngModel)]="selected[col.field]"></p-chips></td>
                <td *ngIf="col.editor.type == 'textArea'" style="width: 100%;"><textarea style="width: 100%; height: 100px" pInputTextarea [(ngModel)]="selected[col.field]"></textarea></td>
                <td *ngIf="col.editor.type == 'enum'" style="width: 100%;">
                  <p-dropdown [disabled]="col.editor.disabled" [placeholder]="col.editor.placeholder" (onChange)="onChange(col.editor.onChange)" [style]="{ 'width': '100%' }"
                    [options]="col.editor.options" [(ngModel)]="selected[col.field]"></p-dropdown>
                </td>
                <td *ngIf="col.editor.type == 'ref'" style="width: 100%;">
                  <p-dropdown [disabled]="col.editor.disabled" [placeholder]="col.editor.placeholder" (onChange)="onChange(col.editor.onChange)" [style]="{ 'width': '100%' }"
                    [options]="getRefOptions(col)" [(ngModel)]="selected[col.field]"></p-dropdown>
                </td>
                <td *ngIf="col.editor.type == 'datetime'" style="width: 100%;">
                  <p-calendar [defaultDate]="now" 
                    selectOtherMonths="true" 
                    monthNavigator="true" 
                    yearNavigator="true" 
                    yearRange="2016:2020"
                    [(ngModel)]="selected[col.field]" 
                    showTime="showTime" 
                    hourFormat="24"
                    styleClass="ui-column-filter"></p-calendar>
                </td>
                <td *ngIf="col.editor.type == 'logs'" style="width: 100%;">
                  <pre>{{ col.editor.logs(selected[col.field]) }}</pre>
                </td>
                <td *ngIf="col.editor.type == 'image'" style="width: 100%;">
                  <label>
                    <img *ngIf="selected[col.field]" [src]="selected[col.field]" />
                    <span *ngIf="!selected[col.field]">上传</span>
                    <input (change)="onFileChange($event, col)" type="file" style="display: none;" />
                  </label>
                </td>
                <td *ngIf="col.editor.type == 'images'" style="width: 100%;">
                  <div *ngFor="let image of selected[col.field]; let i = index">
                    <label>
                      <img [src]="image" />
                      <input (change)="onFilesChange($event, col, i)" type="file" style="display: none;" />
                    </label>
                    <div style="padding: 8px">
                      <a (click)="selected[col.field].splice(i, 1)">删除</a>
                    </div>
                  </div>
                  <div>                    
                    <label>
                      <a>添加</a>
                      <input (change)="onFilesChange($event, col, selected[col.field].length)" type="file" style="display: none;" />
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p-footer>
        <div class="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix">
          <button *ngIf="!params.hideDelete" class="ui-button-danger" style="float: left" type="button" pButton icon="fa-trash" (click)="delete()" label="删除"></button>
          <button *ngIf="!params.hideCancel" class="ui-button-secondary" type="button" pButton icon="fa-close" (click)="cancel()" label="取消"></button>
          <button *ngIf="!params.hideSave" class="ui-button-info" type="button" pButton icon="fa-check" (click)="save()" label="保存"></button>
          <button *ngFor="let b of params.editorButtons" [class]="b.class" type="button" pButton [icon]="b.icon" (click)="b.handler(self)" [label]="b.label"></button>
        </div>
      </p-footer>
    </p-dialog>
    <p-confirmDialog header="操作确认" icon="fa fa-question-circle" width="425"></p-confirmDialog>
    <p-growl [value]="msgs"></p-growl>
</div>
`,
  providers: [ConfirmationService]
})
export class YcjsAdminCRUDComponent implements OnInit {
  self: any;
  @Input() params: YcjsAdminCRUDParams;
  data: YcjsRequestPaginateData;
  lastOptions: any;
  lastFilters: any;
  lastEvent: any;
  selected: any;
  showModal: boolean;
  msgs: Message[] = [];
  columnOptions: SelectItem[];
  now: Date = new Date();
  refs: any = {};

  constructor(
    public confirmationService: ConfirmationService,
    public api: YcjsAPI,
    public auth: YcjsAuth
  ) {
    this.self = this;
  }

  ngOnInit(): void {
    this.columnOptions = [];
    for (let col of this.params.cols) {
      this.columnOptions.push({ label: col.header, value: col });
    }
    this.loadData(JSON.stringify({
      limit: 0,
      page: 1
    }), JSON.stringify({}));
  }

  loadData(options: any, filters: any): void {
    let url: string = `${this.params.api}?_options=${options}&_filters=${filters}`;
    console.log('load url:', url);
    YcjsRequest(
      'GET',
      url,
      null,
      { Authorization: `Bearer ${this.auth.getUser().jwt}` }
    )
      .then(res => {
        if (this.params.renderer) {
          this.data = this.params.renderer(res.data);
        } else {
          this.data = res.data;
        }
        this.lastFilters = filters;
        this.lastOptions = options;
        if (this.params.dt)
          this.params.dt.paginator = true;
      })
      .catch(console.error);
  }

  loadLazy(event: LazyLoadEvent, dt: DataTable): void {
    console.log(event);
    this.lastEvent = event;
    this.params.dt = dt;
    let page: number = Math.floor(event.first / event.rows) + 1;
    let limit: number = event.rows === 100 ? 99999999 : event.rows;
    let options: any = this.params.globalOptions || {};
    options.limit = limit;
    options.page = page;
    if (event.sortField) {
      let str: string = event.sortField;
      if (event.sortOrder === -1) str = '-' + str;
      options.sort = str;
    }

    let filters: any = this.params.globalFilters || {};
    for (let k of Object.keys(event.filters)) {
      switch (event.filters[k].matchMode) {
        case 'in':
          filters[k] = { $in: event.filters[k].value };
          break;
        case 'startsWith':
          filters[k] = { $regex: '^' + event.filters[k].value };
          break;
        case 'endsWith':
          filters[k] = { $regex: event.filters[k].value + '$' };
          break;
        case 'equals':
          filters[k] = event.filters[k].value;
          break;
        case 'range':
          filters[k] = { $gte: event.filters[k].value[0], $lt: event.filters[k].value[1] };
          break;
        case 'id':
          if (event.filters[k].value && event.filters[k].value.length === 24) {
            filters[k] = event.filters[k].value;
          } else {
            delete filters[k];
          }
          break;
      }
    }
    this.loadData(JSON.stringify(options), JSON.stringify(filters));
  }

  select(event: any): void {
    console.log(event.data);
    this.selected = JSON.parse(JSON.stringify(this.selected));
    if (this.params.preEdit)
      this.params.preEdit(this);
    for (let col of this.params.cols) {
      if (col.editor && col.editor.type === 'datetime') {
        this.selected[col.field] = new Date(this.selected[col.field]);
      }
      if (col.editor && col.editor.type === 'chip') {
        this.selected[col.field] = this.selected[col.field] || [];
      }
    }
    this.showModal = true;
    if (this.params.onShow) this.params.onShow.bind(this)();
  }

  add(): void {
    this.selected = {};
    if (this.params.preEdit)
      this.params.preEdit(this);
    this.showModal = true;
  }

  edit(item: any): void {
    this.selected = JSON.parse(JSON.stringify(item));
    this.showModal = true;
  }

  getDisplayCols(): YcjsAdminCRUDParamsCol[] {
    return this.params.cols.filter(x => {
      if (!x.display) return true;
      if (x.display.type === 'hide') return false;
      return true;
    });
  }

  getEditorCols(): YcjsAdminCRUDParamsCol[] {
    return this.params.cols.filter(x => x.editor);
  }

  onChange(fn: Function): void {
    if (!fn) return;
    fn.bind(this)();
  }

  cancel(): void {
    this.showModal = false;
    this.selected = null;
  }

  save(): void {
    let url: string;
    let method: string;
    if (this.selected._id) {
      url = this.params.api + '/' + this.selected._id;
      method = 'PATCH';
    } else {
      url = this.params.api;
      method = 'POST';
    }
    let params: any = {};
    for (let key of Object.keys(this.selected)) {
      switch (this.selected[key]) {
        default:
          params[key] = this.selected[key];
      }
    }
    if (this.params.preSave) this.params.preSave(params);
    YcjsRequest(method, url, params, { Authorization: `Bearer ${this.auth.getUser().jwt}` }, !this.params.formdata)
      .then(res => {
        if (params) {
          this.loadData(this.lastOptions, this.lastFilters);
        } else {
          this.loadData(JSON.stringify({
            limit: this.data.limit,
            page: 1,
            sort: '-_id'
          }), JSON.stringify({}));
        }
        this.cancel();
        this.msgs.push({
          severity: 'success', summary: '保存成功'
        });
      })
      .catch(error => {
        console.error(error);
        this.msgs.push({
          severity: 'error', summary: '保存失败', detail: error.data.message
        });
      });
  }

  delete(): void {
    this.confirmationService.confirm({
      message: '删除后不能返回，确定删除?',
      accept: () => {
        YcjsRequest('DELETE', `${this.params.api}/${this.selected._id}`, null, { Authorization: `Bearer ${this.auth.getUser().jwt}` })
          .then(res => {
            this.cancel();
            this.msgs.push({
              severity: 'success', summary: '删除成功'
            });
            this.loadData(this.lastOptions, this.lastFilters);
          })
          .catch(error => {
            console.error(error);
            this.msgs.push({
              severity: 'error', summary: '删除失败', detail: error.data.message
            });
          });
      }
    });
  }

  addDatetimeFilterRange(col: any): void {
    let fr: Date = col.filter.fr;
    let to: Date = col.filter.to;
    if (!fr || !to) return;
    let value: [number] = [fr.getTime(), to.getTime()];
    let field: Date = col.field;
    let mode: string = col.filter.mode;
    this.params.dt.filter(value, field, mode);
  }

  reload(): void {
    this.params.dt.filter(null, 'dummy', 'in');
    this.params.dt.paginator = false;
  }

  getRefOptions(col: any): any {
    if (this.refs[col.field]) return this.refs[col.field];
    this.refs[col.field] = [];
    YcjsRequest('GET', col.editor.ref.path, null, { Authorization: `Bearer ${this.auth.getUser().jwt}` })
      .then(res => {
        this.refs[col.field] = res.data.docs.map(x => {
          return {
            label: col.editor.ref.label.constructor === String ? x[col.editor.ref.label] : col.editor.ref.label(x),
            value: x._id
          };
        });
        this.refs[col.field].unshift({
          label: '请选择',
          value: null
        });
      })
      .catch(console.error);
    return this.refs[col.field];
  }

  exportCSV(dt: DataTable): void {
    console.log(dt);
    let header: string = dt.columns.map(x => x.header).join(',');
    let rows: any = dt.value.map(obj => {
      return dt.columns.map(x => {
        let col: YcjsAdminCRUDParamsCol = this.params.cols.find(y => y.field === x.field);
        if (col.display && col.display.type === 'enum')
          return col.display.map(dt.resolveFieldData(obj, x.field));
        return dt.resolveFieldData(obj, x.field);
      }).join(',');
    }).join('\n');
    let body: string = [header, rows].join('\n');
    let blob: Blob = new Blob([body], {
      type: 'text/csv;charset=utf-8;'
    });
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(blob, this.params.title.list + '.csv');
    } else {
      let link: HTMLAnchorElement = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link);
      if (link.download !== undefined) {
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', this.params.title.list + '.csv');
        document.body.appendChild(link);
        link.click();
      } else {
        body = 'data:text/csv;charset=utf-8,' + body;
        window.open(encodeURI(body));
      }
      document.body.removeChild(link);
    }
  }

  onFileChange(e: any, col: YcjsAdminCRUDParamsCol): void {
    if (e.target.files && e.target.files[0]) {
      col.editor.upload(e.target.files[0])
        .then(url => {
          this.selected[col.field] = url;
        })
        .catch(console.error);
    }
  }

  onFilesChange(e: any, col: YcjsAdminCRUDParamsCol, index: number): void {
    if (e.target.files && e.target.files[0]) {
      col.editor.upload(e.target.files[0])
        .then(url => {
          this.selected[col.field][index] = url;
        })
        .catch(console.error);
    }
  }
}

export interface YcjsAdminCRUDParams {
  api: string;
  title: {
    list: string,
    edit: string
  };
  cols: YcjsAdminCRUDParamsCol[];
  rows?: number;
  onShow?: () => void;
  hideAdd?: boolean;
  hideDelete?: boolean;
  hideSave?: boolean;
  hideCancel?: boolean;
  hideExport?: boolean;
  dt?: DataTable;
  customButtons?: [YcjsAdminCRUDParamsCustomButton];
  editorButtons?: [YcjsAdminCRUDParamsEditorButton];
  globalFilters?: any;
  globalOptions?: any;
  formdata?: boolean;
  preSave?: (self: any) => void;
  preEdit?: (self: any) => void;
  renderer?: (data: YcjsRequestPaginateData) => YcjsRequestPaginateData;
}

export interface YcjsAdminCRUDParamsCustomButton {
  label: string;
  handler: (self: any) => void;
  class?: string;
  icon?: string;
}

export interface YcjsAdminCRUDParamsCol {
  field: string;
  header: string;
  style?: Object;
  sortable?: boolean;
  filter?: YcjsAdminCRUDParamsColFilter;
  display?: YcjsAdminCRUDParamsColDisplay;
  editor?: YcjsAdminCRUDParamsColEditor;
}

export interface YcjsAdminCRUDParamsEditorButton {
  label: string;
  handler: (self: any) => void;
  class?: string;
  icon?: string;
}

export interface YcjsAdminCRUDParamsColEditor {
  type: 'text' | 'chip' | 'textArea' | 'switch' | 'enum' | 'ref' | 'datetime' | 'logs' | 'image' | 'images';
  ref?: {
    label: ((x: any) => string) | String,
    path: string
  };
  options?: any;
  onChange?: () => void;
  placeholder?: string;
  disabled?: boolean;
  logs?: (x: any) => string;
  upload?: (x: any) => Promise<string>;
}

export interface YcjsAdminCRUDParamsColFilter {
  placeholder: string;
  type: 'text' | 'single' | 'multiple' | 'datetime-range';
  mode: 'contains' | 'startsWith' | 'endsWith' | 'equals' | 'in' | 'range' | 'id';
  options?: any;
  fr?: any;
  to?: any;
}

export interface YcjsAdminCRUDParamsColDisplay {
  type: 'text' | 'enum' | 'switch' | 'hide';
  map?: (x: any) => any;
}
