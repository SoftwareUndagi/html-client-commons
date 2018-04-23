import * as React from 'react';

import { JqGridColumnProps, JqGridButtonProps , JqGridManualRowRenderer , PredefinedColumnAndButtonParameter } from './GridPanelComponent';
import { JqGridColumHeaderPanelProps, JqGridColumHeaderPanel } from './JqGridColumHeaderPanel';
import { JqGridRowColumnPanel } from './JqGridRowColumnPanel';
import { CommonCommunicationData  , ListOfValueManager , CloseEditorCommandAsync , isNull } from 'core-client-commons/index';
import { ListOfValueComponent } from '../../ListOfValueComponent';
import { GridDataAlign , GridColumnCustomFormatterParameter } from '../SimpleGridMetadata';
import { ClientStorageUtils } from '../../../utils/ClientStorageUtils';
import { JqColumnButtonGroupPanel } from './JqColumnButtonGroupPanel';
import { JqGridFooterButton } from './JqGridFooterButton';
import { JqGridContentPanel } from './JqGridContentPanel';
import { JqGridHeaderPanel } from './JqGridHeaderPanel';
import { JqRenderSimpleRowParameter } from './GridPanelComponent';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';
/**
 * format data untuk menyimpan data dalam local storage(1 column)
 */
export interface JqGridStoreSettingColumnData  {

    /**
     * nama field. ini di pakai untuk mengecek key yang collision(sama dengan yang lain. untuk mengindari index out of bound dalam kasus salah data)
     */
    fieldName: string ; 
    /**
     * lebar column
     */
    width: number ; 
}
/**
 * untuk store data seluruh grid
 */
export interface JqGridStoreSettingGridData {
    /**
     * columns untuk grid
     */
    columns: JqGridStoreSettingColumnData[] ; 
}
/**
 * props dari grid
 */
export interface BaseGridPanelProps<DATA> extends   BaseHtmlComponentProps {
    /**
     * space untuk di pakai di sisi kiri. pergunakan ini untuk space menu
     */
    spaceUsedOnLeftSide?: number;

    /**
     * space yang di sediakan sisi kanan dari grid
     */
    spaceUsedOnRightSide?: number;
    /**
     * id dari grid. di set increment
     */
    gridId: string;

    /**
     * title dari grid
     */
    gridTitle: string;
    /**
     * tinggi dari grid
     */
    gridHeight?: number;
    /**
     * lebar grid. untuk di set berapa minimum
     */
    gridMinimumWidth?: number;
    /**
     * renderer row manual
     */
    manualRowRenderer?: JqGridManualRowRenderer<DATA> ; 

    /**
     * lebar dari grid. di kirim dari parent grid. ini set baku untuk grid
     */
    width ?: number ; 

    /**
     * title untuk action column. kalau ada action column. posisi action column adalah setelah row number
     */
    actionColumnTitle?: string;

    /**
     * lebar action column. ini ada defaultnya. 
     */
    actionColumnWidth?: number;
    /**
     * row number param. ini di masukan kalau grid memiliki row number column. pada sisi paling kiri
     */
    rowNumberParam?: {
        /**
         * label untuk header
         */
        headerLabel: string;

        /**
         * lebar nya berapa (px)
         */
        width: number;
    };
    /**
     * handler kalau row di click. kalau memerlukan task tertentu ( misal aktivasi button)
     */
    onRowSelectedHandler?: (data: DATA, rowIndex: number) => any;
    /**
     * conditional. grid di hidden atau tidak
     */
    hidden?: boolean; 
    /**
     * key yang di pakai untuk menyimpan informasi grid ke state
     */
    saveStateKey ?: string ; 
    /**
     * generator panel setelah data row. misal kalau memerlukan sub panel, di masukan di sini
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel?: ( param: JqAfterDataRowGeneratorParameter<DATA>) => JSX.Element[] ; 
    /**
     * generator initial state untuk row(untuk keperluan sub row). misal anda perlu expand collapse panel
     * @param data data untuk di buatkan state nya
     * @param rowIndex index dari row untuk di render
     */
    generatorInitialRowStateData ?: (data: DATA , rowIndex: number ) => {[id: string]: any } ; 
    /**
     * id dari lookup untuk di load
     */
    lookupIds?: string[] ; 
    /**
     * ini kalau panel grid menyesuaikan dengan tinggi dari data
     */
    noVerticalScroll?: boolean ; 
    /**
     * kalau ini bukan null , maka data column + button di load dari parameter. bukan scan children pada componentWillMount
     */
    predefinedColumnAndButtonParameter ?: PredefinedColumnAndButtonParameter<DATA> ; 
    /**
     * generator custom style untuk row. untuk manipulasi style row dengan kondisi 
     */
    customRowCssStyleGenerator ?: ( data: DATA , rowIndex: number ) => React.CSSProperties ;  
    /**
     * berlaku untuk scrollable grid. minumum height berapa. dalam kasus tidak ada data atau jumah data terlalu sedikit. default di isi 200
     */
    minimumHeight ?: number; 
}
/**
 * wrapper parameter untuk generate data setelah row 
 */
export interface JqAfterDataRowGeneratorParameter<DATA> {

    /**
     * data untuk di sebagai acuan
     */
    data: DATA  ;  
    /**
     * index dari row data
     */
    rowIndex: number ; 
    /**
     * column def dari grid
     */
    columnDefinitions: JqGridColumnProps<DATA>[] ;

    /**
     * state dari row
     */
    rowStateContainer: {[id: string]: any};

    /**
     * untuk meminta grid update
     */
    updateGridState: () => any ; 

}

export interface BaseGridPanelState<DATA> extends BaseHtmlComponentState {

    /**
     * data list untuk grid. ini unuk di render dalam grid
     */
    listData: DATA[];
    
    /**
     * container state dari row, data di taruh per row
     */
    rowStateContainer ?:  {[id: string]: any} [] ;

    /**
     * data lookup sesuai dalam definisi dari grid. ini di pergunakan dalam kasus column definition berisi lookupId
     */
    gridDataJoinedLookups?: {[id: string]: {[id: string]: CommonCommunicationData.CommonLookupValue} }; 
    /**
     * container lookup actual yang di pakai oleh grid
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
    
    /**
     * data yang sedang di pilih
     */
    selectedData: DATA;
    /**
     * index dari selected data. 
     */
    selectedRowindex: number;
    /**
     * flag header collapsed atau tidak
     */
    headerCollapsed: boolean;
    /**
     * grid buttons.baik itu button di bawah grid, atau pun button dalam row grid
     */
    gridButtons: JqGridButtonProps<DATA>[];

    /**
     * column defs
     */
    columnDefinitions: JqGridColumnProps<DATA>[];
    /**
     * apakah grid ada search nya apa tidak
     */
    haveSearchPanel ?: boolean ; 
    /**
     * lebar grid berdasarkan column width 
     */
    widthComputedColumn: number;
    /**
     * flag untuk menampilkan load block panel
     */
    showingLoadBlockerPanel: boolean ; 
    /**
     * panel container data. ini yang di scroll-scroll dalam panel
     */
    dataContainerPanel?: HTMLDivElement ; 
}
/**
 * jqgrid like panel. di buat dengan react
 */
export abstract class BaseGridPanel<DATA, PROPS extends BaseGridPanelProps<DATA>, STATE extends BaseGridPanelState<DATA>> extends BaseHtmlComponent<PROPS, STATE> {

    /**
     * id dari grid
     */
    gridId: string;

    /**
     * lookup manager
     */
    lookupManager: ListOfValueManager =  ListOfValueComponent.generateLookupManager(  );
    /**
     * panel untuk bounding rect
     */
    boundingDivPanel: HTMLDivElement ; 

    /**
     * panel loading untuk di tampilkan dalam loading panel
     */
   loadingPanel: JSX.Element ; 
   /**
    * table yang berisi hanya data. dalam panel yang scrollable
    */
   dataOnlyTable: HTMLTableElement ; 

    /**
     * status dari button. ini kalau misal ada perubahan , untuk memaksa reload
     */
    buttonEnabledFlagArray: Array<boolean>  ; 
    /**
     * content panel. bagian tengah dair grid. untuk render popup
     */
    gridContentPanel: JqGridContentPanel<DATA> ; 

    constructor(props: PROPS) {
        super(props);
        let swapSt: any = this.generateDefaultState(); 
        this.state = swapSt ; 
        swapSt.dataContainerPanel = null ; 
        swapSt.haveSearchPanel = false ; 
        swapSt.lookupContainers = {};
        swapSt.gridButtons = [];
        this.gridId = props.gridId;
        if (isNull(this.gridId)) {
            this.gridId = 'auto_grid_' + new Date().getTime() + '.' + Math.ceil(Math.random() * 100);
        }
        if ( isNull(this.props.predefinedColumnAndButtonParameter)) {
            this.scanGridChildrenForColumnsAndButtons(this.state , this.props); 
        } else {
            this.fillColumnsAndButtonDefinitionWithPropsParameter(this.props , this.state) ; 
        }
        this.buttonEnabledFlagArray = this.readButtonEnableFlag(); 
    }

    /**
     * checker action buttons. enabled flag 
     */
    readButtonEnableFlag (): Array<boolean> {
        if ( isNull(this.state.gridButtons) || this.state.gridButtons.length === 0 ) {
            return [] ; 
        }
        let rslt: Array<boolean> =  this.state.gridButtons.map( st => { return this.readButtonEnableFlagAtomic(st); });
        return rslt ; 
    }

    /**
     * state generator
     */
    abstract generateDefaultState(): STATE;
    /**
     * selected data dalam grid
     */
    get currentSelectedData(): DATA {
        return this.state.selectedData;
    }
    componentDidMount() {
        if ( !isNull(this.props.lookupIds) && this.props.lookupIds!.length > 0) {
            this.requestLoadLookup(this.props.lookupIds! ); 
        }
    }

    /**
     * generator row number column
     * @param prop prop utnuk definisi row number
     */
    generateRowNumberColumnDef (prop: PROPS): JqGridColumnProps<DATA> {
        let cDef: JqGridColumnProps<DATA> = {
            align: GridDataAlign.right,
            columnTitle: isNull(prop.rowNumberParam) || isNull( prop.rowNumberParam!.headerLabel) ? 'No' :  prop!.rowNumberParam!.headerLabel!,
            width: isNull(prop.rowNumberParam) || isNull( prop!.rowNumberParam!.width) ? 40 :  prop!.rowNumberParam!.width ,
            fieldName: null!,
            key: 'row_no_column',
            
            customFormatter: (  param: GridColumnCustomFormatterParameter<any> ): JSX.Element => {
                // slet data: DATA = param.data  ;
                let  rowIndex: number = param.rowIndex ; 
                // let  selectedData: boolean = param.selectedData ;
                let rowNo: number = this.getStartRowNumber() + rowIndex;
                return <span key={'row_no_' + rowIndex} >{rowNo}</span>;
            }
        };
        return cDef ; 
    }
    
    /**
     * 
     * @param lookupIds request data lookup
     */
    requestLoadLookup (lookupIds: string []  ) {
        if ( !isNull(this.props.lookupIds)) {
            this.lookupManager.requestLookupDataWithLovIds(lookupIds)
                .then( (lookups: {[id: string]: CommonCommunicationData.CommonLookupValue[]} ) => {
                    if ( !isNull(lookups)) {
                        this.setStateHelper ( st => {
                            if ( isNull(st.lookupContainers)) {
                                st.lookupContainers = {} ; 
                            }
                            let keys: string [] = Object.keys(lookups); 
                            for ( let k of keys ) {
                                st.lookupContainers[k] = lookups[k] ; 
                            }
                        }) ; 
                    }
                }).catch( exc => {
                    console.error('[JqBaseGridPanel]Gagal load lookup dalam grid, error  :  ' , exc) ;
                });
        }
    }
    
    componentDidUpdate(prevProps: PROPS, prevState: STATE) {
        let chgLookup: boolean = false ; 
        if ( !isNull( this.props.lookupIds) && isNull(prevProps.lookupIds) ) {
            chgLookup = true ; 
        }
        if ( !isNull( this.props.lookupIds) && !isNull(prevProps.lookupIds) ) {
           chgLookup = this.props!.lookupIds!.join('.') !==  prevProps!.lookupIds!.join('.');
        }
        if ( !isNull( this.props.lookupIds) && chgLookup) {
            this.requestLoadLookup(this.props.lookupIds!);
        }
    }

    /**
     * state dari grid
     * @param rowIndex 
     */
    getGridRowState: ( rowIndex: number ) => any = ( rowIndex: number ) => {
        if ( rowIndex < 0 ||  isNull(this.state.rowStateContainer) ||  rowIndex >= this.state!.rowStateContainer!.length) {
            return null ; 
        }
        return this.state!.rowStateContainer![rowIndex] ; 
    }
    /**
     * update data state. agar grid terupdate
     */
    updateState: () => any = () => {
        this.setStateHelper(st => {
            //
        });
    }
    /**
     * button definition untuk grid
     */
    generateButtonRendererDefinition(): JqGridColumnProps<DATA> {
        let r: JqGridColumnProps<DATA> = {
            fieldName: '',
            columnTitle: isNull(this.props.actionColumnTitle) ? 'tindakan' : this.props.actionColumnTitle!,
            width: isNull(this.props.actionColumnWidth) ? 60 : this.props.actionColumnWidth!,
            key: this.gridId + '_action_column',
            customFormatter: ( parameter: GridColumnCustomFormatterParameter<DATA> ) => {
                let data: DATA = parameter.data ; 
                let rowIndex: number =  parameter.rowIndex ;    
                let selectedData: boolean = parameter.selectedData; 
                let sButton: any = this.state.gridButtons;
                let sData: any = data;
                return (
                <JqColumnButtonGroupPanel
                    requestGridStateData={this.getGridRowState}
                    applyGridState={this.updateState}
                    data={sData}
                    rowIndex={rowIndex}
                    selectedFlag={selectedData}
                    buttons={sButton}
                    key={this.gridId + '_action_column'}
                />);
            }
        };
        return r;
    }

    /**
     * starting row number . default = 1
     */
    getStartRowNumber(): number {
        return 1;
    }

    /**
     * assign data ke dalam grid
     * @param listData
     */
    assignData(listData: DATA[] , doNotUpdateState?: boolean , targetState?: STATE ) {
        if ( !isNull(doNotUpdateState) && doNotUpdateState ) {
            if ( isNull(targetState)) {
                targetState = this.state ; 
            }
            this.__assignDataWorker(listData , targetState!);
        } else {
            this.setStateHelper ( st => {
                this.__assignDataWorker(listData , st);
            }); 
        }
    }

    /**
     * actual worker untuk menyalin data ke dalam list data container
     * @param listData list data untuk di salin
     * @param targetState state tujuan salin data
     */
    __assignDataWorker(listData: DATA[] , targetState: STATE  ) {
        targetState.listData = isNull(listData) ? null ! : [...listData];
        targetState.rowStateContainer = [] ; 
        let stateGenerator: (data: DATA , rowIndex: number ) => {[id: string]: any } = isNull(this.props.generatorInitialRowStateData) ? (data: DATA , rowIndex: number ) => { return {}; } : this.props.generatorInitialRowStateData!; 
        if ( !isNull(listData)) {
            for ( let i = 0 ; i < listData.length ; i++) {
                targetState.rowStateContainer.push(stateGenerator(listData[i] , i ));
            }
        }
    }
    /**
     * hanlder kalau sort berubah
     * @param columnDef definisi column. yang akan di baca untuk membaca metadata
     * @param asc flag asc sort atau sebailknya
     */
    onChangeSort: (columnDef: JqGridColumnProps<DATA>, asc: boolean) => void = (columnDef: JqGridColumnProps<DATA>, asc: boolean) => {
        //
    }
    /**
     * worker untuk menulis ke localstorage
     */
    saveGridConfiguration () {
        if ( isNull(this.props.saveStateKey)) {
            console.log('[BaseGridPanel#saveGridConfiguration] configurasi grid tidak di simpan dalam storage,karena key tidak di set') ;
            return ; 
        }
        let cnf: JqGridStoreSettingGridData = {
            columns: [] 
        };
        for ( let c of this.state.columnDefinitions) {
            cnf.columns.push({ fieldName: c.fieldName , width : c.width});
        }
        let clientStorageUtil: ClientStorageUtils = new ClientStorageUtils() ; 
        clientStorageUtil.setValue( 'grid_' +  this.props.saveStateKey  , JSON.stringify(cnf) , () => {
            //
        });
    }
    /**
     * load config columnd ari localstorage
     * @param key key dari grid config dalam localstorage
     * @param columnDefinitions definisi column untuk di load dari local storage
     */
    loadGridConfigurationOnLocalStorage ( key: string , columnDefinitions: JqGridColumnProps<DATA>[]) {
        if ( isNull(key) || key.length === 0 ) {
            return ; 
        }
        let rawConfig: string =  localStorage.getItem(key)! ; 
        if ( isNull(rawConfig)  || rawConfig.length === 0 ) {
            console.log('[JqBaseGridPanel] gagal membaca config untuk table dengan key : ' , key , ' tidak ada data config di simpan') ; 
            return ; 
        }
        let dta: JqGridStoreSettingGridData = JSON.parse(rawConfig) ; 
        if ( dta.columns.length !== columnDefinitions.length) {
            console.log('[JqBaseGridPanel] config grid untuk grid  dengan key : ' , key , ' tidak sama, column grid : ' , columnDefinitions.length , ' dalam konfig di simpan : ' , dta.columns.length , '. konfigurasi di abaikan') ; 
            return ; 
        }
         // cek dulu 
        for ( let idx = 0 ; idx < dta.columns.length; idx++) {
            if ( dta.columns[idx].fieldName !== columnDefinitions[idx].fieldName) {
                console.warn('[BaseGridPanel#loadGridConfiguration] kemungkinan ada duplikat key untuk storage key grid : ' , key);
                return ; 
            }
        }
        for ( let idx = 0 ; idx < dta.columns.length; idx++) {
            columnDefinitions[idx].width = dta.columns[idx].width ;  
        }

    }
    /**
     * load konfigurasi grid dari local storage
     */
    loadGridConfiguration () {
        if ( isNull(this.props.saveStateKey)) {
            console.log('[BaseGridPanel#loadGridConfiguration] configurasi grid tidak di simpan dalam storage,karena key tidak di set') ;
            return ; 
        }
        let val: string = localStorage.getItem('grid_' + this.props.saveStateKey)!; 
        if ( isNull(val)   || val.length === 0) { 
            return ; 
        }
        this.setStateHelper ( 
            st => {
                let dta: JqGridStoreSettingGridData = JSON.parse(val) ; 
                // cross check dulu 
                if ( dta.columns.length !== st.columnDefinitions.length) {
                    return ; 
                }
                // cek dulu 
                for ( let idx = 0 ; idx < dta.columns.length; idx++) {
                    if ( dta.columns[idx].fieldName !== st.columnDefinitions[idx].fieldName) {
                        console.warn('[BaseGridPanel#loadGridConfiguration] kemungkinan ada duplikat key untuk storage key grid : ' , this.props.saveStateKey);
                        return ; 
                    }
                }
                for ( let idx = 0 ; idx < dta.columns.length; idx++) {
                    st.columnDefinitions[idx].width = dta.columns[idx].width ;  
                }
                this.updateCalculatedField(st); 
            } );
        
    }

    /**
     * worker untuk membuat column headers rows 1.
     * 
     */
     rendererTaskGridColumnHeader( columnDef: JqGridColumnProps<DATA>, columnIndex: number  ,  key: string): JSX.Element {
        let s: any = columnDef.defaultSort;
        if (isNull(s)) {
            s = 'asc';
        }
        let pCol: JqGridColumHeaderPanelProps = {
            label: columnDef.columnTitle,
            width: columnDef.width,
            elementKey: key,
            defaultSort: s,
            onSortChange: isNull(columnDef.sortable) || !columnDef.sortable ? null! : (asc: boolean) => {
                this.onChangeSort(columnDef, asc);
            }, 
            gridHeight: this.gridActualHeight, 
            boundingGridPanelId : this.gridId + '_scroller_panel' , 
            resizeColumnCommand : this.resizeColumnWidth.bind(this) ,
            columnIndex : columnIndex
        };
        console.log('[BaseGridPanel] render header column dengan prop : ' , pCol);
        return <JqGridColumHeaderPanel key={key} {...pCol}/>;
    }

    /**
     * command untuk menaruh panel dalam grid. ini untuk search yang perlu areal lebar. ndak cukup dengan drop down
     */
    putPanelInsideGridCommand: ( panels: JSX.Element[] ) => CloseEditorCommandAsync = ( panels: JSX.Element[] ) => {
        if ( isNull(this.gridContentPanel)) {
            return () => {
                return  new Promise<any>( ( accpt: ( n: any ) => any  , reject: (exc: any  ) => any  ) => {
                    accpt({}); 
                }) ;
            }; 
        }
        return this.gridContentPanel.putPanelInsideGridCommand(panels) ; 
    }
    /**
     * worker untuk membuat column headers rows 1.
     */
    rendererTaskGridColumnHeaders(gridWidth: number): JSX.Element {
        let colDefs: any = this.state.columnDefinitions ; 
        return (
        <JqGridHeaderPanel 
            gridWidth={gridWidth}
            assignQueryHandler={this.emptyNoActionMethos}
            assignQueryOnIncludeModel={this.emptyNoActionMethos}
            removeQueryHandler={this.emptyNoActionMethos}
            removeQueryOnIncludeModel={this.emptyNoActionMethos}
            columnDefinitions={colDefs}
            cssForSearchTextBox={null!}
            gridId={this.gridId}
            key={'header_panel'}
            headerCollapsed={this.state.headerCollapsed}
            lookupContainers={this.state.lookupContainers}
            lookupManager={this.lookupManager}
            navigate={this.emptyNoActionMethos}
            widthComputedColumn={this.state.widthComputedColumn}
            rowNumberParam={null!}
            resizeColumnWidth={this.resizeColumnWidth}
            onChangeSort={this.emptyNoActionMethos}
            gridActualHeight={this.gridActualHeight}
            putPanelInsideGridCommand={this.putPanelInsideGridCommand}
        />
        );
    }

    /**
     * dalam detail. ini row pertama dalam grid data
     */
    rendererFirstRow(): JSX.Element {
        let tds: any[] = [];
        let idx: number = 1;
        window['latestListData'] =  this.state.listData ; 
        let heightPnlHeight: string =  isNull( this.state.listData) ||  this.state.listData.length === 0  ? '1px' : '0px'; 
        for (let l of this.state.columnDefinitions) {
            tds.push(<td role="gridcell" key={'auto_head_column_' + this.gridId + '_' + idx} style={{ height: heightPnlHeight, width: l.width + 'px' }}/>);
            idx++;
        }
        return (
        <tr key={'auto_head_row1st_' + this.gridId} className="jqgfirstrow" role="row" style={{ height: 'auto' }}>
            {tds}
        </tr>);

    }

    /**
     * resizer column header
     */
    resizeColumnWidth: ( index: number ,    panelNewWidth: number ) => any = ( index: number ,    panelNewWidth: number ) => {
        let columnDefinition: JqGridColumnProps<DATA> = this.state.columnDefinitions[index];
        columnDefinition.width = panelNewWidth ; 
        this.setStateHelper ( 
            st => this.updateCalculatedField(st) ,  
            this.saveGridConfiguration.bind(this)); 
    }
    /**
     * handler kalau grid scroll
     */
    onGridScrolled() {
        let scroledElement: HTMLElement = document.getElementById(this.gridId + '_scroller_panel')!;
        let headerScroller: HTMLElement = document.getElementById(this.gridId + '_header_scroller')!;
        headerScroller.scrollLeft = scroledElement.scrollLeft;
    }

    /**
     * handler saat div di scroll. panel harus di scroll sesuai dengan posisi
     */
    onScroll: ( scrollLeft: number ) => any = ( scrollLeft: number ) => {
        let headerScroller: HTMLElement = document.getElementById(this.gridId + '_header_scroller')!;
        headerScroller.scrollLeft = scrollLeft;
    }
    /**
     * handler kalau row di pilih
     */
    onRowClick: ( data: DATA , rowIndex: number  ) => any = ( data: DATA , rowIndex: number  ) => {
        console.log('no row click handler');
    }
    focus() {
        try {
            let el: HTMLElement  = document.getElementById("gbox_" + this.gridId)!; 
            if ( !isNull(el)) {
                el.tabIndex = 1000 ; 
                el.focus(); 
                setTimeout(
                    () => {
                        el.removeAttribute('tabindex');
                    } , 
                    100);
            } else {
                console.error('[JqBaseGridPanel] element dengan ID  ' , "gbox_" + this.gridId , ' tidak di temukan dalam DOM tree, focus grid tidak di trigger' ); 
            }
        } catch ( exc) {
            console.error('[JqBaseGridPanel] gagal focus ke elemen, erorr : ' , exc) ; 
        }
        
    }
    /**
     * worker untuk menampilkan loading panel
     */
    showLoadingPanel ( panel: JSX.Element ) {
        this.loadingPanel  = panel ; 
        this.setStateHelper ( st => st.showingLoadBlockerPanel = true ); 
    }

    hideLoadingPanel () {
        this.setStateHelper ( st => st.showingLoadBlockerPanel = false ); 
    }
    /**
     * lebar grid yang akan di render untuk grid
     */
    get gridActualWidth (): number {
        let lebar1: number = this.state.widthComputedColumn ;
        lebar1 += 25 ; 
        if ( !isNull(this.props.width)) {
            if ( this.props.width > lebar1) {
                return lebar1  ; 
            }
            return this.props.width! ; 
        }
        // ini spt nya lebar grid calculated. lebar window - space
        if (!isNull(this.props.gridMinimumWidth) && lebar1 < this.props.gridMinimumWidth) {
            lebar1 = this.props.gridMinimumWidth!;
        }
        let lebarWindow: number = window.innerWidth;
        let kiri: number = isNull(this.props.spaceUsedOnLeftSide) ? 0 : this.props.spaceUsedOnLeftSide!;
        let spaceKanan: number = isNull(this.props.spaceUsedOnRightSide) ? 0 : this.props.spaceUsedOnRightSide!;
        let lebarGridAvailable: number = lebarWindow - kiri - spaceKanan;
        if (lebar1 > lebarGridAvailable) {
            lebar1 = lebarGridAvailable;
        }
        return lebar1 ; 
    }
    /**
     * pager sisi tengah. ini biasanya tempat pagin
     */
    rendererTaskFooterCenter(): JSX.Element {
        return <input type='hidden' key={this.gridId + 'center_footer'} id={this.gridId + 'center_footer'} />;
    }
    /**
     * renderer footer. untuk tempat button2 . paging di sertakan sini 
     */
    rendererTaskFooterButtons(): JSX.Element {
        let btns: any[] = [];
        let idx: number = 0;
        for (let b of this.state.gridButtons) {
            if (isNull(b.renderButtonOnColumnFlag) || !b.renderButtonOnColumnFlag) {
                let swapbtnProp: any = b ; 
                let swapSelected: any = this.state.selectedData ; 
                btns.push((
                <JqGridFooterButton 
                    buttonProp={swapbtnProp}
                    key={'footer_button_' + idx}
                    gridId={this.gridId}
                    index={idx}
                    selectedData={swapSelected}
                    selectedRowindex={this.state.selectedRowindex}
                />
                )); 
                idx++;
            }
        }
        return (
            <table
                id={this.gridId + "_footer_button_table"}
                key={this.gridId + "_footer_button_table"}
                className="ui-pg-table navtable"
                style={{ float: 'left', tableLayout: 'auto' }}
            >
                <tbody 
                    id={this.gridId + "_footer_button_table_tbody"}
                    key={this.gridId + "_footer_button_table_tbody"}
                >
                    <tr>
                        {btns}
                    </tr>
                </tbody>
            </table>
            );
    }

    render(): JSX.Element {
        let lebar1: number = this.gridActualWidth! ; 
        let headerCss: string = this.state.headerCollapsed ? 'ui-icon ui-icon-circle-triangle-s' : 'ui-icon ui-icon-circle-triangle-n';
        let height: number = this.gridActualHeight ;
        let gridTopStyle: React.CSSProperties = {
             width: lebar1 + 'px' , 
             display : !isNull(this.props.hidden) && this.props.hidden ? 'none' : 'block' 
        };
        return (
            <div 
                key={this.gridId + '_outmost_grid'} 
                className="ui-jqgrid ui-widget ui-widget-content ui-corner-all simpeg_grid_border"
                id={"gbox_" + this.gridId} 
                dir="ltr"
                ref={ (theDiv: any ) => {
                    this.boundingDivPanel  = theDiv ; 
                } }
                style={gridTopStyle}
            >
                <div key={this.gridId + 'child1.1'} className="ui-widget-overlay jqgrid-overlay" id={"lui_" + this.gridId}>{}</div>
                <div key={this.gridId + 'child1.2'} className="ui-jqgrid-view" id={"gview_" + this.gridId} style={{ width: lebar1 + 'px' }}>
                    <div key={this.gridId + 'child1.2.1'} className="ui-jqgrid-titlebar ui-jqgrid-caption ui-widget-header ui-corner-top ui-helper-clearfix">
                        <a 
                            role="link"
                            onClick={() => {
                                this.setStateHelper ( st => {
                                    st.headerCollapsed = !st.headerCollapsed;
                                });
                            } }
                            className="ui-jqgrid-titlebar-close ui-corner-all HeaderButton"
                            style={{ right: '0px' }}
                        ><span className={headerCss}>{}</span>
                        </a>
                        <span className="ui-jqgrid-title">{this.props.gridTitle}</span>
                    </div>
                    {this.rendererTaskGridColumnHeaders(lebar1)}{/*migrated*/}
                    {this.rendererGridRows(lebar1, height)}{/* migrated*/}
                    {this.rendererLoadingPanel(lebar1, height)}
                </div>
                <div key={this.gridId + 'child1.3'} className="ui-jqgrid-resize-mark" id={"rs_m" + this.gridId}>&nbsp;</div>
                {this.rendererTaskGridFooter(lebar1, height)}
            </div>);
    }
    /**
     * tinggi actual dari grid. kalau null akan di set 300
     */
    get gridActualHeight (): number {
        /*if ( !isNull(this.props.noVerticalScroll) && this.props.noVerticalScroll && !isNull(this.state.gridActualHeight)){
            return this.state.gridActualHeight ; 
        }*/
        if ( isNull(this.props.gridHeight)) {
            console.log('[BaseGridPanel] return default grid , karena parameter : props.gridHeight null  ' , this.props.gridHeight); 
            return 300 ; 
        }
        console.log('[BaseGridPanel] return value dari param  , karena parameter : ' , this.props.gridHeight); 
        return   this.props.gridHeight!; 
    }

    /**
     * row renderer.untuk render data
     * @param data data unuk di render
     * @param rowIndex index dari row
     */
    protected rendererGridRow(param: JqRenderSimpleRowParameter<DATA>): JSX.Element {
        let data: DATA = param.data ;
        let rowIndex: number = param.rowIndex;
        let rowId: string = this.gridId + '_row_' + rowIndex;
        let cssRow: string = 'ui-widget-content jqgrow ui-row-ltr ';
        if (data === this.state.selectedData) {
            cssRow += 'ui-state-highlight';
        }
        let cols: any[] = [];
        let colIndex: number = 0;
        let sData: any = data;

        for (let c of this.state.columnDefinitions) {
            let sCol: any = c;
            cols.push((
            <JqGridRowColumnPanel
                data={sData}
                requestGridStateData={this.getGridRowState}
                updateGridStateCommand={this.updateState}
                key={'automated_row_' + rowIndex + '_' + colIndex}
                rowNumber={rowIndex}
                columnNumber={colIndex}
                lookupContainer={this.state.lookupContainers}
                gridDataJoinedLookups={this.state.gridDataJoinedLookups!}
                selectedDataFlag={data === this.state.selectedData}
                columnDefinition={sCol} 
            />));
            colIndex++;
        }
        return (
        <tr 
            key={'automatic_row_' + rowIndex} 
            role="row" 
            id={rowId} 
            tabIndex={-1}
            onMouseEnter={() => {
                document.getElementById(rowId)!.className = cssRow + ' ui-state-hover';
            } }
            onMouseLeave={() => {
                document.getElementById(rowId)!.className = cssRow;
            } }
            onClick={() => {
                if (this.state.selectedData !== data) {
                    this.setStateHelper (st => {
                        st.selectedRowindex = rowIndex;
                        st.selectedData = data;
                    });
                }
            } }
            className={cssRow}
        >{cols}
        </tr>);
    }
    /**
     * update variable: this.state.widthComputedColumn. untuk berapa lebar dalam scroller
     */
    private updateCalculatedField ( targetState: STATE ) {
        let n: number = 0 ; 
        for ( let colDef of targetState.columnDefinitions ) {
            n += colDef.width ; 
        }
        targetState.widthComputedColumn = n ; 
    }
    /**
     * kalkulasi lebar grid. berapa actual yang di perlukan 
     */
    private calculateColumnWidth(): number {
        let r: number = 0;
        for (let c of this.state.columnDefinitions) {
            r += c.width;
        }
        return r;
    }

    /**
     * checker per button
     * @param buton button untuk di proses
     */
    private readButtonEnableFlagAtomic (buton: JqGridButtonProps<DATA> ) {
        if ( !isNull(buton.originalButtonProps) && !isNull(buton.originalButtonProps!.doNotRenderIfCustomEvaluator)) {
            let empty: any = {} ; 
            let chkDoNotnderIfFunc: boolean = buton.originalButtonProps!.doNotRenderIfCustomEvaluator!(empty); 
            return !chkDoNotnderIfFunc ; 
        } else if ( !isNull(buton.doNotRenderIfCustomEvaluator)) {
            let empty: any = {} ; 
            let chkDoNotnderIfFunc: boolean = buton.doNotRenderIfCustomEvaluator!(empty); 
            return !chkDoNotnderIfFunc ; 
        } else if ( !isNull(buton.doNotRenderIf)) {
            return !buton.doNotRenderIf ; 
        } else if ( !isNull(buton.hidden)) {
            return !buton.hidden ;
        }   
        return true ; 
    }
    /**
     * menyalin dari prop ke state, sekaligus task terkait dengan perhitungan expected width dll
     * @param prop prop asal salinan
     * @param stateTarget target tmp menaruh data
     */
    private fillColumnsAndButtonDefinitionWithPropsParameter (prop: PROPS , stateTarget: STATE) {
        stateTarget.columnDefinitions = [];
        stateTarget.gridButtons = []; 
        // let idxColDef: number = 0;
        if (!isNull(prop.rowNumberParam)) {
            // idxColDef = 1;
            stateTarget.columnDefinitions.push(this.generateRowNumberColumnDef(prop));
        }

        if ( !isNull(prop!.predefinedColumnAndButtonParameter!.gridButtons)  && prop!.predefinedColumnAndButtonParameter!.gridButtons.length > 0 ) {
            stateTarget.gridButtons.push(...prop!.predefinedColumnAndButtonParameter!.gridButtons);
            stateTarget.columnDefinitions.push(this.generateButtonRendererDefinition()) ; 
        }
        stateTarget.columnDefinitions.push(...prop!.predefinedColumnAndButtonParameter!.columnDefinitions) ;
        if ( !isNull(prop.saveStateKey) && prop!.saveStateKey!.length > 0 ) {
            this.loadGridConfigurationOnLocalStorage( prop!.saveStateKey! , stateTarget.columnDefinitions);
        }
        let r: number = 0;
        for (let c of stateTarget.columnDefinitions) {
            r += c.width;
        }
        stateTarget.widthComputedColumn = r + 5 ; 

    }
    /**
     * ini untuk memeriksa grid children. ini di lakukan dalam componentWillmount. kalau misal parameter column + button tidak di spesifikasikan dari props, maka children akan di scan
     * 
     */
    private scanGridChildrenForColumnsAndButtons ( targetState: STATE , props: any ) {
        targetState.columnDefinitions = [];
        let idxColDef: number = 0;
        if (!isNull(props.rowNumberParam)) {
            idxColDef = 1;
            targetState.columnDefinitions.push(this.generateRowNumberColumnDef(props));
        }
        targetState.columnDefinitions.push(this.generateButtonRendererDefinition());
        let onColCount: number = 0;
        let btnContainers: any[] = [];
        let s: any = props.children;
        for (let l of s) {
            this.childComponentSeparator( targetState.columnDefinitions, btnContainers, l , this.state);
        }
        if (btnContainers.length > 0) {
            targetState.gridButtons = btnContainers;
            console.log('[BaseGridPanel] button yang di proses: ' , btnContainers) ;
        } else {
            console.log('[BaseGridPanel] button kosong untuk grid') ;
        }

        for (let b of targetState.gridButtons) {
            if (b.renderButtonOnColumnFlag) {
                onColCount++;
            }
        }
        if (onColCount === 0) {
            targetState.columnDefinitions.splice(idxColDef, 1);
        }
        targetState.widthComputedColumn = this.calculateColumnWidth() + 5;
        this.loadGridConfiguration(); 
        
    }

    /**
     * renderer loading blocker panel
     */
    private rendererLoadingPanel (width: number, height: number): JSX.Element  {
        if (! this.state.showingLoadBlockerPanel) {
            return <input type='hidden' key={this.props.gridId + '_loading_blocker'} id={this.props.gridId + '_loading_blocker'}/> ;
        }
        let style: React.CSSProperties = {
            opacity : 1 ,
            width  : width + 'px' , 
            height:  height + 'px' , 
            backgroundColor :  '#f5f5f5' , 
            
        };

        return (
        <div style={style}  key={this.props.gridId + '_loading_blocker'}>
            {isNull(this.loadingPanel) ?  <span>{}</span> : this.loadingPanel}
        </div>
        );
    }
    /**
     * renderer footer grid
     * @param width
     * @param height
     */
    private rendererTaskGridFooter(width: number, height: number): JSX.Element {
        let style: any = { width: width + 'px' , borderRight: '1px solid #E1E1E1'  , borderLeft: '1px solid #E1E1E1'};
        if (this.state.headerCollapsed) {
            style.display = 'none';
        }
        // let style: React.CSSProperties = { height: height + 'px', width: width + 'px' , borderRight: '1px solid #E1E1E1'  , borderLeft: '1px solid #E1E1E1'};
        return (
        <div 
            key={this.gridId + '_pager'} 
            id={this.gridId + "_main_pager"}
            className="ui-state-default ui-jqgrid-pager ui-corner-bottom"
            dir="ltr" 
            style={style}
        >
            <div
                key={"pg_" + this.gridId + "_main_pager"}
                id={"pg_" + this.gridId + "_main_pager"}
                className="ui-pager-control" 
                role="group"
            >
                <table
                    cellSpacing={0}
                    cellPadding={0}
                    className="ui-pg-table" 
                    style={{ width: '100%', tableLayout: 'fixed', height: '100%' }}
                    role="row"
                >
                    <tbody>
                        <tr>
                            <td id={this.gridId + "_main_pager_left"} style={{textAlign : 'left'}}>{this.rendererTaskFooterButtons()}</td>
                            <td id={this.gridId + "_main_pager_center"} style={{ whiteSpace: 'pre', width: '380px' , textAlign : 'center'}}>
                                {this.rendererTaskFooterCenter()}
                            </td>
                            <td id={this.gridId + "_main_pager_right"} style={{textAlign : 'right'}} >{}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>);
    }
    private emptyNoActionMethos: ( ) => any = () => {
        //
    }
    /**
     * ini untuk memisah column vs button
     */
    private childComponentSeparator(colDefs: any[], buttonDefs: JqGridButtonProps<DATA>[], ch: any , targetState: STATE ) {
        
        if (Array.isArray(ch)) {
            let arr: any[] = ch;
            for (var ch1 of arr) {
                this.childComponentSeparator(colDefs, buttonDefs, ch1 , targetState);
            }
            return;
        }
        if (ch == null || typeof ch === 'undefined' || ch.props == null || typeof ch.props === 'undefined') {
            console.log('[BaseGridPanel] button di skip, karena flag : cg ' , ch );
            return;
        }
        if (ch.props.fieldName != null && ch.props.fieldName !== "undefined" && ch.props.columnTitle != null && ch.props.columnTitle !== "undefined") {
            let xx: JqGridColumnProps<DATA> = ch.props ; 
            if ( !isNull(xx.searchDefinition)) {
                targetState.haveSearchPanel = true ; 
            }
            let salinan:  JqGridColumnProps<DATA> = {
                align : xx.align , 
                columnTitle: xx.columnTitle , 
                cssProviderDataColumn : xx.cssProviderDataColumn , 
                customFormatter : xx.customFormatter , 
                defaultSort: xx.defaultSort , 
                fieldName: xx.fieldName , 
                gridRowTitleGenerator : xx.gridRowTitleGenerator , 
                hiddenColumn : xx.hiddenColumn , 
                lookupParameter : xx.lookupParameter , 
                searchDefinition : xx.searchDefinition , 
                sortable: xx.sortable , 
                textFormatter : xx.textFormatter , 
                width : xx.width , 
                key : 'col_' + colDefs.length + 1 

            } ; 
            let keys: string[] = Object.keys(ch.props) ; 
            for ( let k of keys ) {
                salinan[k] = ch.props[k];
            }
            colDefs.push(salinan);
        } else if (!isNull(ch.props.clickHandler)) {
            let btnProps: JqGridButtonProps<DATA> = ch.props;
            if (!isNull(btnProps.doNotRenderIf) && btnProps.doNotRenderIf) {
                console.log('[BaseGridPanel] button di skip, karena flag :' , btnProps.doNotRenderIf);
                return;
            }
            buttonDefs.push(ch.props);
        }
    }
    /**
     * row renderer.untuk render data
     */
    private rendererGridRows(width: number, height: number): JSX.Element {
        let swapcolumnDefinitions: any = this.state.columnDefinitions; 
        let swapgeneratorAfterRowDataPanel: any = this.props.generatorAfterRowDataPanel ; 
        let swapgridButtons: any = this.state.gridButtons ; 
        let swaplistData: any = this.state.listData ;
        let swapmanualRowRenderer: any = this.props.manualRowRenderer ;
        let swaponRowSelectedHandler: any = this.props.onRowSelectedHandler ;  
        let swaponRowClick: any = this.onRowClick ; 
        let swapCssGenerator: any = this.props.customRowCssStyleGenerator ; 
        return (
            <JqGridContentPanel 
                key='grid_content'
                columnDefinitions={swapcolumnDefinitions}
                generatorAfterRowDataPanel={swapgeneratorAfterRowDataPanel}
                gridButtons={swapgridButtons}
                getGridRowState={this.getGridRowState}
                gridDataJoinedLookups={this.state.gridDataJoinedLookups}
                gridId={this.props.gridId}
                height={height}
                width={width}
                listData={swaplistData}
                hidden={this.props.hidden! || this.state.headerCollapsed || this.state.showingLoadBlockerPanel}
                lookupContainers={this.state.lookupContainers}
                manualRowRenderer={swapmanualRowRenderer}
                onRowClick={swaponRowClick}
                onRowSelectedHandler={swaponRowSelectedHandler}
                onScroll={this.onScroll}
                widthComputedColumn={this.state.widthComputedColumn}
                noVerticalScroll={this.props.noVerticalScroll!}
                minimumHeight={this.props.minimumHeight!}
                customRowCssStyleGenerator={swapCssGenerator}
                ref={(d: any) => {
                    this.gridContentPanel = d ; 
                }}
            />); 
        
    }
}