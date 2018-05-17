import * as React from "react" ;
import { ListOfValueManager , CommonCommunicationData } from 'core-client-commons'; 
import { IDbDrivenGridPanel, SimpleDbDrivenGridLookupProps, SimpleGridAfterRowDataPanelGeneratorParameter, GridColumnCustomTextFormatterMethod } from './SimpleGridMetadata'; 
import { JqAfterDataRowGeneratorParameter } from './scrollable/JqBaseGridPanel';
import { JqDbDrivenGridPanel , JqGridManualRowRenderer , PredefinedColumnAndButtonParameter , __jqExtractColumnAndButton } from './scrollable/index';
import { BaseGridProps } from './BaseGrid';
import { isNull } from '../../utils/index';
import { SimpleDbDrivenGridWithSimpleTable } from './SimpleDbDrivenGridWithSimpleTable';
import { BaseHtmlComponent } from "../BaseHtmlComponent";

/**
 * props untuk scrollable part dari db driven panel
 */
export interface SimpleDbDrivenGridScrollableProps<DATA> {
    /**
     * ini kalau panel grid menyesuaikan dengan tinggi dari data
     */
    noVerticalScroll?: boolean ; 
    /**
     * berlaku untuk scrollable grid. minumum height berapa. dalam kasus tidak ada data atau jumah data terlalu sedikit. default di isi 200
     */
    minimumHeight ?: number;
    /**
     * id dari lookup untuk di load
     */
    lookupIds ?: string []; 
    /**
     * kalau ini di set, grid akan diset dengan angka ini langsung. ini meng-asumsikan lebar grid di ketahui oleh parent
     */
    width ?: number ; 
    /**
     * title dari grid
     */
    gridTitle: string;
    /**
     * nilai default 40(px), kalau perlu page size berbeda di set dengan variable ini
     */
    pagingTextboxWidth ?: number  ; 

    /**
     * lebar dari row number 
     */
    rowNumberWidth ?: number ; 

    /**
     * label untuk row number 
     */
    rowNumberLabel ?: string ; 
    /**
     * handler kalau row di click. kalau memerlukan task tertentu ( misal aktivasi button)
     */
    onRowSelectedHandler?: (data: DATA, rowIndex: number) => any ; 

    /**
     * tinggi grid
     */
    gridHeight ?: number ; 
    /**
     * space untuk di pakai di sisi kiri. pergunakan ini untuk space menu
     */
    spaceUsedOnLeftSide?: number;

    /**
     * space yang di sediakan sisi kanan dari grid
     */
    spaceUsedOnRightSide?: number;

    /**
     * lebar grid. untuk di set berapa minimum
     */
    gridMinimumWidth?: number;
    /**
     * lebar dari action column
     */
    actionColumnWidth ?: number ; 

    /**
     * key yang di pakai untuk menyimpan informasi grid ke state
     */
    saveStateKey ?: string ;
    /**
     * generator panel setelah data row. misal kalau memerlukan sub panel, di masukan di sini. ini untuk jqgrid. ini untuk jqgrid
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel ?:  ( param: JqAfterDataRowGeneratorParameter<DATA>) => JSX.Element[] ; 
    /**
     * manual grid renderer
     */
    manualGridRenderer ?: JqGridManualRowRenderer<DATA> ; 
       
}
/**
 * props untuk DB driven grid
 */
export interface SimpleDbDrivenGridProps<DATA> extends BaseGridProps<DATA> {
     /**
      * handler pada saat data baru di terima dari server. sebelum di render
      */
    handlerBeforeDataRenderToRows?: ( data: CommonCommunicationData.GridDataRequestResponse<DATA>) => any ; 
   
    /**
     * model name untuk di search
     */
    modelName: string ; 
    /**
     * where dari data(predefined)
     */
    predefinedWhere?: any ;

    /**
     * include model param. ini kalau perlu join
     */
    includeModelParams?: CommonCommunicationData.IncludeModelParam[];

    /**
     * sort dari data
     */ 
    sorts?: Array<string[]> |Array<CommonCommunicationData.SortParamAssociated >; 

    /**
     * lookup codes yang di pergunakan grid
     */
    lookupCodes?: string[]; 
    /**
     * lookup manager parameter. ini di pergunakan kalau lookup berasal dari external
     */
    lookupManagerParameter?: SimpleDbDrivenGridLookupProps; 
    /**
     * custom data loader
     */
    customDataLoader ?: ( param: CommonCommunicationData.PagedDataRequest<DATA>) => Promise<CommonCommunicationData.PagedDataQueryResult<DATA>>; 
    /**
     * parameter page size
     */
    pageSizeParam?: {
        /**
         * dari variable pageSizes , index berapa yang di pilih. default 0 
         */
        defaultSelectedIndex?: number; 
        /**
         * pages yang di sediakan dalam selector
         */
        pageSizes: number[]; 

    };

     /**
      * handler kalau request ke server gagal
      */
     onRequestDataFailHandler ?: (code: string , message: string , exc: any ) => any ; 
     /**
      * di load pada saat mount atau tidak data
      */
     loadDataOnMount: boolean ; 
     /**
      * override untuk action column title. akan di default dengan i18nkey : control-common.grid.action-column
      */
     actionColumnTitle?: string;
     /**
      * lebar dari column 
      */
     actionColumnWidth: number; 
    /**
     * configurasi untuk paging
     */
     pagingConfiguration ?: {

        /**
         * batasi paging atau tidak. ini kalau param pagingConfiguration akan di set true 
         */
        limitDisplayedPage: boolean; 

        /**
         * pager di tampilkan. sebaiknya ini ganjil
         */
        numberOfPagerDisplayed?: number; 

    };

    /**
     * di action column kalau memerlukan custom control. misal : tombol add di pergunakan di sini 
     */
     actionColumnFirstRowCustomGenerator?: (
         assignQuery: (field: string, whereValue: any) => any,
         assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any,
         reloadGridMethod: () => any,
         lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] },
         lookupManager: ListOfValueManager) => JSX.Element; 

    /**
     * untuk #1st row pada row number
     */
    rowNumberFirstRowFormatter?: (
         assignQuery: (field: string, whereValue: any) => any,
         assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any,
         reloadGridMethod: () => any,
         lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] },
         lookupManager: ListOfValueManager) => JSX.Element; 

    /**
     * panel untuk row 1. ini biasanya search entry  + add new button
     * @param  assignQuery worker untuk assign query. ini untuk assign ke where, bukan ke include model. plain query
     * @param assignQueryOnIncludeModel assign query ke include model
     */
     generate1stRowPanel?: (
         assignQuery: (field: string, whereValue: any) => any,
         assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any,
         reloadGridMethod: () => any,
         lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] } , 
         lookupManager: ListOfValueManager ) => JSX.Element; 

    /**
     * generate footer panels. di atas paging. di sini anda mandatory menggerate bersama dengan <strong>tr</strong>
     * @param dataCount total data (semua)
     * @param page page berapa sekarang ( index dari 0 )
     * @param gridData data untuk grid sekarang
     * @param lookDataContainer container lookup data
     * @param lookupManager lookup manager, kalau memerlukan data lookup
     */
    generateFooterRowPanels?: (
        dataCount: number , 
        page: number , 
        gridData: DATA[] , 
        lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] } , 
        lookupManager: ListOfValueManager ) => JSX.Element[]; 

    /**
     * handler kalau row di click
     */
    rowClickHandler ?: ( data: DATA , rowIndex: number  ) => any ; 

    /**
     * generator initial state untuk row(untuk keperluan sub row). misal anda perlu expand collapse panel
     * @param data data untuk di buatkan state nya
     * @param rowIndex index dari row untuk di render
     */
    generatorInitialRowStateData ?: (data: DATA , rowIndex: number ) => {[id: string]: any } ; 
    /**
     * ini untuk grid normal
     * @param data row data , yang di render pada row yang di buatkan sub nya
     * @param columnDefinitions  definisi columns
     * @param rowStateContainer container state. misal untuk show hide
     */
    generatorAfterRowDataPanel ?: ( parameter: SimpleGridAfterRowDataPanelGeneratorParameter<DATA> ) => JSX.Element[] ; 

    /**
     * untuk grid dengan renderer jqgrid
     */
    scrollableGridParameter ?: SimpleDbDrivenGridScrollableProps<DATA>;
    /**
     * handler pada saat data di terima
     */
    onDataRecievied ?: ( where: any  , data: CommonCommunicationData.PagedDataRequestResult<DATA>  ) => any ;
    
} 

export interface SimpleDbDrivenGridState <DATA> {
    /**
     * filler saja, agar tidak warning di typescript
     */
    dummy ?: DATA;
}

export class SimpleDbDrivenGrid<DATA> extends BaseHtmlComponent<SimpleDbDrivenGridProps<DATA>, SimpleDbDrivenGridState<DATA>> implements IDbDrivenGridPanel<DATA> {
    assignQueryHandler: (field: string, whereValue: any) => any;
    assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any ;
    lookupManager: ListOfValueManager;
    /**
     * id dari grd
     */
    gridId: string  = 'grid_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 1000); 
    /**
     * definisi button + column dari scrollable grid
     */
    scrollableGridParam:  PredefinedColumnAndButtonParameter<DATA> ;  
    /**
     * flag tipe grid scrollabel atau bukan
     * 
     */
    scrollableGrid: boolean ; 

    /**
     * grid actual yang merender grid panel. ntah scrollable atau simple grid
     */
    actualGrid: IDbDrivenGridPanel<DATA> ; 
    constructor(props: SimpleDbDrivenGridProps<DATA>) {
        super( props) ; 
        this.state = {} ; 
        this.assignQueryHandler =  (field: string, whereValue: any) =>  {
            if ( isNull(this.actualGrid)) {
                console.warn('[SimpleDbDrivenGrid#assignQueryHandler] grid tidak tersedia. kemungkainan terlewat dalam ref' );
                return ; 
            }
            this.actualGrid.assignQueryHandler(field , whereValue);
        };
        this.assignQueryOnIncludeModel = (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => {
            if ( isNull(this.actualGrid)) {
                console.warn('[SimpleDbDrivenGrid#assignQueryOnIncludeModel] grid tidak tersedia. kemungkainan terlewat dalam ref' );
                return ; 
            }
            // di ganti untuk bug http://redmine.surfer-girl.com:81/issues/32 point : untuk di main panel, filter header, date rage, location dan user is notworking, sebelumnya recursive ke diri sendiri tidak hinga
            // parameter 1 salahm dari modelAs di ganti dengan modelName  #http://redmine.surfer-girl.com:81/issues/69
            this.actualGrid.assignQueryOnIncludeModel(modelName , fieldName, whereValue , useInnerJoin , modelAs ) ; 
        };
        this.scrollableGrid = this.isScrollableGridAllowed() && !isNull(props.scrollableGridParameter);
        if ( this.scrollableGrid) {
            let swachld1: any = props.children! ;
            let colDefs: any[] = swachld1 ;
            this.scrollableGridParam = __jqExtractColumnAndButton(colDefs  , this.scrollableGrid ? 'scrollable'  : 'simple');
        }

    }

    focus () {
        try {
            this.actualGrid.focus(); 
        } catch ( exc ) {
            console.error('[SimpleDbDrivenGrid] gagal focus ke elemen, error : ' , exc );
        }
    }
    updateState(): void {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#updateState] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return ; 
        }
        this.actualGrid.updateState(); 
    }
    getRowStateData(rowIndex: number): { [id: string]: any; } {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#getRowStateData] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return null!; 
        }
        return this.actualGrid.getRowStateData(rowIndex);
    }
    getGridData(): DATA[] {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#getGridData] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return null!; 
        }
        return this.actualGrid.getGridData();
    }
    reloadGrid(): void {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#reloadGrid] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return null!; 
        }
        return this.actualGrid.reloadGrid();
    }
    navigate(page: number): void {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#navigate] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return null!; 
        }
        return this.actualGrid.navigate(page);
    }
    generateSimpleCurrencyFormatter(useDotThousandSeparator: boolean, remainFraction: number): GridColumnCustomTextFormatterMethod<DATA> {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#generateSimpleCurrencyFormatter] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return null!; 
        }
        return this.actualGrid.generateSimpleCurrencyFormatter(useDotThousandSeparator , remainFraction ); 
    }
    getPageSizes(): number[] {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#getPageSizes] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return null!; 
        }
        return this.actualGrid.getPageSizes();
    }
    getSelectedPageSize(): number {
        if ( isNull(this.actualGrid)) {
            console.warn('[SimpleDbDrivenGrid#getPageSizes] grid tidak tersedia. kemungkainan terlewat dalam ref' );
            return null!; 
        }
        return this.actualGrid.getSelectedPageSize();
    }

    render () {
        let swapcustomDataLoader: any = this.props.customDataLoader ; 
        let swapgeneratorAfterRowDataPanel: any = this.props.generatorAfterRowDataPanel ; 
        let swapgeneratorInitialRowStateData: any = this.props.generatorInitialRowStateData ; 
        if ( !this.scrollableGrid) {
            let swapgenerate1stRowPanel: any = this.props.generateFooterRowPanels ; 
            let swaprowClickHandler: any = this.props.rowClickHandler!; 
            let swaponDataRecievied: any = this.props.onDataRecievied! ; 
            return (
            <SimpleDbDrivenGridWithSimpleTable 
                handlerBeforeDataRenderToRows={this.props.handlerBeforeDataRenderToRows}
                actionColumnFirstRowCustomGenerator={this.props.actionColumnFirstRowCustomGenerator}
                actionColumnTitle={this.props.actionColumnTitle}
                actionColumnWidth={this.props.actionColumnWidth}
                appendRowNumberColumn={this.props.appendRowNumberColumn}
                columnWidthUnit={this.props.columnWidthUnit}
                cssName={this.props.cssName}
                customDataLoader={swapcustomDataLoader}
                generate1stRowPanel={this.props.generate1stRowPanel}
                generateFooterRowPanels={swapgenerate1stRowPanel}
                generatorAfterRowDataPanel={swapgeneratorAfterRowDataPanel}
                generatorInitialRowStateData={swapgeneratorInitialRowStateData}
                hidden={this.props.hidden}
                includeModelParams={this.props.includeModelParams}
                loadDataOnMount={this.props.loadDataOnMount}
                lookupCodes={this.props.lookupCodes}
                lookupManagerParameter={this.props.lookupManagerParameter}
                modelName={this.props.modelName}
                onDataRecievied={swaponDataRecievied}
                key='simple_grid_panel'
                onRequestDataFailHandler={this.props.onRequestDataFailHandler}
                pageSizeParam={this.props.pageSizeParam}
                pagingConfiguration={this.props.pagingConfiguration}
                predefinedWhere={this.props.predefinedWhere}
                rowClickHandler={swaprowClickHandler}
                rowCssNameProvider={this.props.rowCssNameProvider}
                rowNumberFirstRowFormatter={this.props.rowNumberFirstRowFormatter}
                rowNumberWidth={this.props.rowNumberWidth}
                sorts={this.props.sorts}
                tableId={this.props.tableId}
                theadCssName={this.props.theadCssName}
                ref={(g: any) => {
                    this.actualGrid = g ; 
                }}
            >{this.props.children}
            </SimpleDbDrivenGridWithSimpleTable>);
        }
        let swaponRowSelectedHandler: any = this.props.scrollableGridParameter!.onRowSelectedHandler !; 
        let swapmanualGridRenderer: any = this.props.scrollableGridParameter!.manualGridRenderer ; 
        let swapColBtnDef: any = this.scrollableGridParam ; 
        let swapCssGen: any = null ; 
        if (!isNull(this.props.customRowCssStyleGenerator)) {
            let hndlr: ( data: DATA , rowIndex: number ) => React.CSSProperties  = ( data: DATA , rowIndex: number ) => {
                return this.props.customRowCssStyleGenerator!('scrollable' , data , rowIndex);
            };
            swapCssGen = hndlr ; 
        }
        let swaponDataRecievied2: any = this.props.onDataRecievied! ; 
        return (
        <JqDbDrivenGridPanel
            handlerBeforeDataRenderToRows={this.props.handlerBeforeDataRenderToRows!}
            customRowCssStyleGenerator={swapCssGen}
            actionColumnTitle={this.props.actionColumnTitle}
            actionColumnWidth={isNull(this.props.scrollableGridParameter!.actionColumnWidth) ? 40 : this.props.scrollableGridParameter!.actionColumnWidth}
            customDataLoader={swapcustomDataLoader}
            generatorAfterRowDataPanel={swapgeneratorAfterRowDataPanel}
            gridId={this.gridId}
            generatorInitialRowStateData={swapgeneratorInitialRowStateData}
            gridHeight={this.props.scrollableGridParameter!.gridHeight}
            gridMinimumWidth={this.props.scrollableGridParameter!.gridMinimumWidth}
            gridTitle={this.props.scrollableGridParameter!.gridTitle}
            hidden={this.props.hidden}
            includedModels={this.props.includeModelParams}
            loadDataOnMount={this.props.loadDataOnMount}
            lookupIds={this.props.scrollableGridParameter!.lookupIds}
            manualRowRenderer={swapmanualGridRenderer}
            modelName={this.props.modelName}
            noVerticalScroll={this.props.scrollableGridParameter!.noVerticalScroll}
            onDataRecievied={swaponDataRecievied2}
            onRowSelectedHandler={swaponRowSelectedHandler}
            pageSizeParam={this.props.pageSizeParam}
            pagingTextboxWidth={this.props.scrollableGridParameter!.pagingTextboxWidth}
            predefinedWhere={this.props.predefinedWhere}
            rowNumberParam={{
                headerLabel : this.props.scrollableGridParameter!.rowNumberLabel !, 
                width : this.props.scrollableGridParameter!.rowNumberWidth!
            }}
            key='scrollable_grid'
            saveStateKey={this.props.scrollableGridParameter!.saveStateKey}
            sorts={this.props.sorts}
            spaceUsedOnLeftSide={this.props.scrollableGridParameter!.spaceUsedOnLeftSide}
            spaceUsedOnRightSide={this.props.scrollableGridParameter!.spaceUsedOnRightSide}
            width={this.props.scrollableGridParameter!.width}
            predefinedColumnAndButtonParameter={swapColBtnDef}
            minimumHeight={this.props.scrollableGridParameter!.minimumHeight}
            ref={( g: JqDbDrivenGridPanel<any> )  => {
                this.actualGrid = g ; 
            }}
        />);

    }
    /**
     * check jqgrid allowed atau tidak
     */
    isScrollableGridAllowed (): boolean   {
        console.log('[BaseGrid#isScrollableGridAllowed] memulai pengecekan scrollable allowed flag');
        let wnd: any = window ; 
        if ( isNull(wnd.MobileDetect)) {
            console.error('[System] mobile detect tidak terinstall, silakan cek pada tag script anda, dokumentasi bisa di cek di sini : https://hgoebl.github.io/mobile-detect.js/' );
            return false ; 
        }
        var md = new wnd.MobileDetect(window.navigator.userAgent);
        let mblChk: any = md.mobile(); 
        console.log('[BaseGrid#isScrollableGridAllowed] mblChk' , mblChk);
        if ( isNull(mblChk)) {
            return true ; 
        } else {
            let chkTab: any = md.tablet(); 
            if ( !isNull(chkTab)) {
                return true ; 
            }
        }
        return false ; 
    }

}