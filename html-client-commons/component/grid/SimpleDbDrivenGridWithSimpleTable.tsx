import * as React from "react" ;
import { CommonCommunicationData , ListOfValueManager, CloseEditorCommandAsync } from 'core-client-commons/index';
import { BaseGrid , BaseGridProps, BaseGridState  } from './BaseGrid';
import { ListOfValueComponent } from '../ListOfValueComponent';
import { ajaxhelper } from '../../utils/ajaxhelper';
import { CoreComponentAjaxUtils } from 'core-client-commons/index';
import { GridColumnProps, GridDataAlign, GridButtonProps, GridColumnDbProps, GridHeaderSearchDefinition, 
        GridHeaderSearchType , ColumnRenderFlag , GridColumnCustomFormatterParameter , GridColumnCustomTextFormatterParameter , 
        SimpleGridAfterRowDataPanelGeneratorParameter , GridColumnCustomTextFormatterMethod , CustomSearchPanelGeneratorParameter , 
        SimpleDbDrivenGridLookupProps , IDbDrivenGridPanel } from './SimpleGridMetadata'; 
import { GridActionColumn } from './GridActionColumn';
import { FormatterUtils, i18n } from '../../utils/FormatterUtils';
import { PagingControl } from './PagingControl';
import { isNull,  cloneObject  } from '../../utils/index' ;
import { VirtualLookupComponent } from '../VirtualLookupComponent';
import { SimpleQueryOperator, SimpleQueryOperatorInputProps } from '../search-form/CommonSearchForm';
import { QueryDateTextbox, QueryTextbox, QueryDateTextboxFromAndTo, QuerySelect2, QueryDateTextboxProps, 
        QueryTextboxProps, QueryDateTextboxFromAndToProps, QuerySelect2Props , 
        QuerySimpleComboBoxProps , QuerySimpleComboBox } from '../search-form/SimpleQueryInputElement';
import { BaseCustomSearchPanel , BaseCustomSearchPanelProps } from './BaseCustomSearchPanel';
import { GridSearchData } from './grid-search-data'; 
import { GridMultipleSelectSearchEntryPanel } from './GridMultipleSelectSearchEntryPanel'; 
/**
 * props untuk DB driven grid
 */
export interface SimpleDbDrivenGridWithSimpleTableProps<DATA> extends BaseGridProps<DATA> {
    /**
     * handler pada saat data baru di terima dari server. sebelum di render
     */
    handlerBeforeDataRenderToRows ?: ( data: CommonCommunicationData.GridDataRequestResponse<DATA>) => any ; 
    /**
     * model name untuk di search
     */
    modelName: string ; 
    /**
     * where dari data(predefined)
     */
    predefinedWhere ?: any ;

    /**
     * include model param. ini kalau perlu join
     */
    includeModelParams ?: CommonCommunicationData.IncludeModelParam[] ;

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
    customDataLoader ?: ( param: CommonCommunicationData.PagedDataRequest<DATA>) => Promise<CommonCommunicationData.PagedDataQueryResult<DATA>> ; 

   /*customDataLoader ?: ( param: CommonCommunicationData.PagedDataRequest<DATA>, 
        onDataRecieved : (data : CommonCommunicationData.PagedDataQueryResult<DATA> ) => any ,   
   onFailure : (code : string, message : string , exc: any ) => any )=> any ;  */
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
     actionColumnFirstRowCustomGenerator ?: (
         assignQuery: (field: string, whereValue: any) => any,
         assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any,
         reloadGridMethod: () => any,
         lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] },
         lookupManager: ListOfValueManager) => JSX.Element; 

    /**
     * untuk #1st row pada row number
     */
    rowNumberFirstRowFormatter ?: (
         assignQuery: (field: string, whereValue: any) => any,
         assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any,
         reloadGridMethod: () => any,
         lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] },
         lookupManager: ListOfValueManager ) => JSX.Element; 
    
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
     * handler pada saat data di terima
     */
    onDataRecievied ?: ( where: any  , data: CommonCommunicationData.PagedDataRequestResult<DATA>  ) => any ;

} 

/**
 * state dari DB driven grid
 */
export interface SimpleDbDrivenGridWithSimpleTableState<DATA> extends BaseGridState<DATA>  {
    /**
     * data untuk di render dalam grid
     */
    data: DATA[]; 
    /**
     * state untuk row
     */
    rowStateContainer: {[id: string]: any }[] ; 
    /**
     * posisi current
     */
    pagePosition: number ;
    /**
     * total page yang ada didapat dari database
     */
    totalPageCount: number ;  
    /**
     * berapa data yang di dapat dari database
     */
    totalDataCount: number ; 
    /**
     * data lookup sesuai dalam definisi dari grid. ini di pergunakan dalam kasus column definition berisi lookupId
     */
    gridDataJoinedLookups ?: {[id: string]: {[id: string]: CommonCommunicationData.CommonLookupValue} };
    /**
     * container lookup. hanya di pergunakan kalau param external tidak di kirimkan untuk lookup. berarti mempergunakan lookup internal
     */
    lookDataContainer: { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] }; 
    /**
     * search column def ini di kalau search mempergunakan search dengan predefined header column
     * key : index dari column definition
     * value : search definition untuk column
     */
    headerColumnSearchParameters: { [id: number]: GridHeaderSearchDefinition } ;
    /**
     * flag apakah ada header search yang di definisikan dalam definisi grid
     */
    haveHeaderColumnSearchParameters: boolean  ; 
    /**
     * page size yang di pilih
     */
    selectedPageSizeIndex: number; 
    /**
     * count terakhir dari data
     */
    latestCount: number ; 
    /**
     * column definitions. salinan dari member variable data
     */
    columnDefinitions: GridColumnProps<DATA>[] ; 
    /**
     * field lookup untuk request ke server
     */
    lookupFields ?: CommonCommunicationData.LookupRequestForLookupOnListDataParam[] ; 
    /**
     * state dari grid. normal = render normal grid, modal-on-content di bagian tbody akan menampilkan on panel untuk view data detail
     */
    viewState: 'normal' |'modal-on-content' ; 
    /**
     * parameter untuk blocking panel
     */
    blockingPanelParameter ?: {
        /**
         * panel untuk di taruh dalam grid. blocking panel 
         */
        insideGridBlockPanels: JSX.Element[] ; 

        /**
         * tinggi dari blocking panel
         */
        panelHeight: number ; 
    };
}
/**
 * class untuk grid db driven
 */
export class SimpleDbDrivenGridWithSimpleTable<DATA> extends BaseGrid<DATA, SimpleDbDrivenGridWithSimpleTableProps<DATA>, SimpleDbDrivenGridWithSimpleTableState<DATA>> implements IDbDrivenGridPanel<DATA> {
 
    /**
     * css untuk search pada header column. ini perlu di sesuaikan dengan masing masing aplikasi css standard untuk textbox
     */
    static DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME: string = null!;
    /**
     * default page size untuk grid. standard bawaan dalam applikasi. kalau param ini tidak di sediakan maka variable ini yang akan di pergunakan
     */
    static DEFAULT_PAGE_SIZES: number[] = [10, 20, 30, 40, 50]; 
    /**
     * where from input query 
     */
    whereFromInput: any = {}; 
    /**
     * where dalam include
     */
    whereOnIncludeFromInput: CommonCommunicationData.IncludeModelParam[] = []; 

    /**
     * assign query worker 
     */
    assignQueryHandler: (field: string, whereValue: any) => any;
    /**
     * ini untuk mengeset kalau misal query di pergunakan dalam include model. 
     */
    assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any; 
    /**
     * lookup manager. untuk akses langsung ke lookup 
     */
    lookupManager: ListOfValueManager; 
    /**
     * batasi paging atau tidak. ini kalau param pagingConfiguration akan di set true 
     */
    limitDisplayedPage: boolean = true ;

    /**
     * pager di tampilkan. sebaiknya ini ganjil
     */
    numberOfPagerDisplayed: number = 7; 
    /**
     * untuk memformat date
     */
    formatterUtils: FormatterUtils = new FormatterUtils() ; 

    /**
     * reference ke html table yang di pergunakan dalam grid
     */
    tableRef: HTMLTableElement ; 
    /**
     * id dari TBODY
     */
    tbodyId: string ; 

    /**
     * untuk akses ka ajax. core method
     */
    private coreAjaxUtils: CoreComponentAjaxUtils; 

    private ajaxhelper: ajaxhelper.AjaxUtils;  

    constructor(props: SimpleDbDrivenGridWithSimpleTableProps<DATA>) {
        super(props) ; 
        this.state = {
            data : null! , 
            pagePosition : 0 , 
            totalDataCount : 0 , 
            totalPageCount: 1,
            lookDataContainer:  isNull(props.lookupManagerParameter) || isNull(props.lookupManagerParameter!.lookDataContainer!) ?   {} : props.lookupManagerParameter!.lookDataContainer ,
            haveHeaderColumnSearchParameters: false,
            headerColumnSearchParameters: {},
            selectedPageSizeIndex : 0 , 
            latestCount : null! , 
            columnDefinitions : []  , 
            gridDataJoinedLookups  :  {} , 
            rowStateContainer : [] , 
            viewState : 'normal'
        }; 
        if ( !isNull(this.props.tableId)) {
            this.tbodyId = this.props.tableId + '_tbody' ; 
        } else {
            this.tbodyId = 'simple_grid_tbody_' +   Math.ceil(Math.random() * 100 ) ; 
        }
        
        this.ajaxhelper = ajaxhelper.generateOrGetAjaxUtils();
        this.coreAjaxUtils = new CoreComponentAjaxUtils(this.ajaxhelper);
        this.lookupManager =  ListOfValueComponent.generateLookupManager( this.ajaxhelper , this.state.lookDataContainer);
        this.assignQueryHandler = (field: string, whereValue: any) => {
            this.setStateHelper ( st => {
                if (isNull(whereValue)) {
                    delete this.whereFromInput[field];
                } else {
                    this.whereFromInput[field] = whereValue;
                }
                st.latestCount = null!;
            });
        };
        this.assignQueryOnIncludeModel = (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => {
            let w1: CommonCommunicationData.IncludeModelParam = null! ; 
            for ( let w of this.whereOnIncludeFromInput) {
                if ( w.modelName === modelName && modelAs === w.as) {
                    w1 = w ; 
                }
            }
            if ( w1 == null ) {
                w1 = {
                    modelName : modelName , 
                    as : modelAs , 
                    where : {} 
                
                };
                if ( useInnerJoin) {
                    w1.required = true ; 
                }
                this.whereOnIncludeFromInput.push(w1);
            }
            if ( whereValue == null ) {
                delete w1.where[fieldName];
            } else {
                w1.where[fieldName] = whereValue ; 
            }
            this.setStateHelper ( st => st.latestCount = null! );
        };
    }
    /**
     * command untuk remove query
     */
    removeQueryHandler: (key: string ) => any = (key: string ) => {
        this.assignQueryHandler( key , null ) ; 
    } 

    /**
     * untuk remove query pada include
     */
    removeQueryOnIncludeModel: (modelName: string , key: string ,      asName ?: string ) => any = (modelName: string , key: string ,      asName ?: string  ) => {
        this.assignQueryOnIncludeModel (modelName , key , null , false , asName );
    }

    focus() {
        try {
            this.tableRef.focus(); 
            if ( !isNull(this.tableRef)) {
                this.tableRef.tabIndex = 1000 ; 
                this.tableRef.focus(); 
                setTimeout(
                    () => this.tableRef.removeAttribute('tabindex') , 
                    100);
            }
        } catch ( exc ) {
            console.error('[SimpleDbDrivenGridWithSimpleTable] gagal focus element , error : ' , exc); 
        }
    }
    /**
     * menandai state dari grid berganti. agar komponen dari grid ter reload
     */
    updateState:  () => any = () => {
        this.setStateHelper (st => {
            //
        }) ; 
        
    }

    /**
     * generate sub panel row. di bawah data. ini format table bebas
     * @param data grid data
     * @param rowIndex index dari data
     */
    populateSubRow (data: DATA , rowIndex: number ): JSX.Element[]  {
        if ( isNull(this.props.generatorAfterRowDataPanel)) {
            return null!; 
        }
        return this.props.generatorAfterRowDataPanel!({
            data : data , 
            rowIndex : rowIndex , 
            columnDefinitions : this.state.columnDefinitions , 
            rowStateContainer : this.getRowStateData(rowIndex) , 
            updateGrid : this.updateState.bind(this)
        });
    }
    /**
     * membaca state untuk di ambil
     * @param rowIndex index dari row yang di ambil
     */
    getRowStateData ( rowIndex: number ): {[id: string]: any } {
        if ( rowIndex < 0 &&  rowIndex >= this.state.rowStateContainer.length ) {
            return null !; 
        }
        return this.state.rowStateContainer[rowIndex];
    }

    /**
     * getter. container data lookup
     */
    get lookupDataContainer(): { [lookupCode: string]: CommonCommunicationData.CommonLookupValue[] } {
        return isNull(this.props.lookupManagerParameter) || isNull(this.props.lookupManagerParameter!.lookDataContainer) ? this.state.lookDataContainer : this.props.lookupManagerParameter!.lookDataContainer;
    }
    /**
     * membaca data grid
     */
    getGridData (): DATA[]  {
        return this.state.data ; 
    } 
    componentWillMount() {
        let rightAlign: any = { textAlign : 'right'};
        let appendRowNumberColumn: boolean = true ; 
        if ( !isNull(this.props.appendRowNumberColumn)) {
            appendRowNumberColumn = this.props.appendRowNumberColumn!; 
        }
        let swapState: any = this.state;
        swapState.columnDefinitions =  []; 
        if ( appendRowNumberColumn) {
            let renderer: (parameter:  GridColumnCustomFormatterParameter<DATA>) => JSX.Element = (parameter:  GridColumnCustomFormatterParameter<DATA>)  => {
                // (data : DATA , rowIndex : number )
                // let data: DATA  = parameter.data ; 
                let rowIndex: number = parameter.rowIndex ;
                let pageSize: number = this.getSelectedPageSize();
                let startRow: number = this.state.pagePosition * pageSize ;
                if ( !isNull(this.props.rowNumberWidth)) {
                    return (
                    <td
                        style={{ width : this.props.rowNumberWidth + this.props.columnWidthUnit , textAlign : 'right'}}
                        key={'row_number_' + rowIndex} 
                    >{startRow + rowIndex}
                    </td>)  ; 
                }  
                return (
                    <td  
                        key={'row_number_' + rowIndex} 
                        style={rightAlign}
                    >{startRow + rowIndex}
                    </td>
                );
            };
            let defRoNumb: GridColumnProps<DATA> = {
                label : 'No' , 
                gridHeaderCssname : 'center' , 
                width : this.props.rowNumberWidth , 
                fieldName : null! ,
                align : GridDataAlign.right , 
                customDataFormatter : renderer, 
                
            }; 
            swapState.columnDefinitions = [defRoNumb];
            
        }

        let swachld1: any = this.props.children ;
        let colDefs: any[] = swachld1 ;
        this.actionButtons = [];
        // let actionButtons: GridButtonProps<DATA> [] = []; 
        for (let d1 of colDefs) {
            if (isNull(d1)) {
                continue; 
            }
            if (Array.isArray(d1)) {
                let swapR: any = d1;
                let sAny: any[] = swapR;
                for (let subComp of sAny) {
                    if (isNull(subComp) || isNull(subComp.props)) {
                        continue; 
                    }
                    this.__subComponentAppender(subComp , this.state);
                }
                continue; 
            }

            if ( isNull(d1.props) ) {
                continue ; 
            }
            this.__subComponentAppender(d1 , this.state);
        } 
        
        if ( this.actionButtons.length > 0 ) {
            let rendererAction:  (param: GridColumnCustomFormatterParameter<DATA> ) => JSX.Element = ( param: GridColumnCustomFormatterParameter<DATA> )  => {
                let data: DATA  = param.data ; 
                let rowIndex: number = param.rowIndex ; 
                let s: any = data ; 
                let sButton: any = this.actionButtons ;
                if ( !isNull( this.props.actionColumnWidth) ) {
                    return (
                    <GridActionColumn
                        buttons={sButton}
                        width={this.props.actionColumnWidth + this.props.columnWidthUnit}
                        keySuffix={'automate_data_' + rowIndex} 
                        data={s}
                    />);    
                } 
                return (
                <GridActionColumn
                    buttons={sButton}
                    keySuffix={'automate_data_' + rowIndex} 
                    data={s}
                />);
            };
            let propAct: GridColumnProps<DATA> = {
                align : GridDataAlign.center , 
                fieldName: '' , 
                width: this.props.actionColumnWidth , 
                gridHeaderCssname : 'center',
                label : isNull(this.props.actionColumnTitle) ? i18n('general.control-common.grid.action-column', 'action') : this.props.actionColumnTitle! , 
                customDataFormatter: rendererAction,
            };
            this.state.columnDefinitions.push(propAct);
            if (!isNull(this.props.actionColumnFirstRowCustomGenerator)) {
                let g: GridHeaderSearchDefinition = {
                    queryField: '',
                    queryOperator: SimpleQueryOperator.EQUAL,
                    searchType: GridHeaderSearchType.TEXTBOX
                };
                let gn: any  = (
                    lookupManager: ListOfValueManager,
                    assignQueryHandler: (field: string, whereValue: any) => any,
                    assignQueryOnIncludeModel: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any) => {
                        return this.props.actionColumnFirstRowCustomGenerator!(
                            assignQueryHandler, assignQueryOnIncludeModel, 
                            () => this.reloadGrid() , 
                            this.lookupDataContainer, lookupManager);
                };
                g.customSearchPanelGenerator = gn; 
                this.state.headerColumnSearchParameters[this.state.columnDefinitions.length - 1] = g;
            }
        }

        // page sizes param 
        if (!isNull(this.props.pageSizeParam)) {
            if (!isNull(this.props.pageSizeParam!.defaultSelectedIndex)) {
                swapState.selectedPageSizeIndex = this.props.pageSizeParam!.defaultSelectedIndex; 
                
            }
        }
        console.log('[SimpleDbDrivenGridWithSimpleTable] column def : ' , this.state.columnDefinitions , '. button : ' , this.actionButtons);
        
    }
    /**
     * worker untuk menaruh panel dalam grid. sebagai popup panel
     */
    putPanelInsideGridCommand: ( panels: JSX.Element[] ) => CloseEditorCommandAsync = ( panels: JSX.Element[] ) => {
        let tinggi: number =  document.getElementById(this.tbodyId)!.offsetHeight ; 
        this.setStateHelper( st => {
            st.blockingPanelParameter = {
                panelHeight : tinggi , 
                insideGridBlockPanels : panels 
            }  ; 
            st.viewState = 'modal-on-content' ; 
        }); 
        return () => {
            return new Promise<any> ( ( accept: (n: any ) => any , reject: (n: any ) => any ) => {
                this.setStateHelper( 
                    st => {
                        st.viewState = 'normal' ; 
                        delete st.blockingPanelParameter ; 
                    } , 
                    ( ) => {
                        accept({}); 
                    });
            }); 
        };
    }
    /**
     * mencari dalam children dari search, ada search panel atau tidak. kalau ada , maka akan return search generator
     * @param columnChildren children dari columns
     */
    findSearchPanel (columnChildren: any  ):  any  {
        if ( isNull(columnChildren)) {
            return null ; 
        }
        let genSearch: (chld:  BaseCustomSearchPanel<any , any >  ) => any = (chld:  BaseCustomSearchPanel<any , any >) => { 
            return { 
                customSearchPanelGenerator : (param: CustomSearchPanelGeneratorParameter) => {
                    let salinanProps: BaseCustomSearchPanelProps = cloneObject(chld.props) ;
                    salinanProps.assignQueryHandler = param.assignQueryHandler ; 
                    salinanProps.assignQueryOnIncludeModel = param.assignQueryOnIncludeModel ; 
                    salinanProps.lookupContainer = param.lookupContainer ; 
                    salinanProps.lookupManager = param.lookupManager ; 
                    let swapComp: any = chld ; 
                    let salinan: any =   React.cloneElement (  swapComp, salinanProps); 
                    return salinan ; 
                } , 
                queryField : chld.props.fieldName ,
                searchType : GridHeaderSearchType.CUSTOM 
            };
        };
        let singleScanner: (n: any ) => any   = (n: any ) => {
            let rslt: any = null ; 
            if ( Array.isArray(n)) {
                rslt = this.findSearchPanel(n) ; 
                if ( !isNull(rslt)) {
                    return rslt ; 
                }
                return rslt ; 

            }
            if ( isNull(n.props) || isNull( n.props.fieldName) ||  n.props.fieldName.length === 0 ) {
                return null ; 
            }
            return genSearch(n); 
        };
        if (!Array.isArray(columnChildren)) {
            return singleScanner(columnChildren) ;
        } else {
            for ( let c of columnChildren ) {
                let s: any = singleScanner(c) ;
                if ( !isNull(s)) {
                    return s ; 
                }
            }
        }
        
    }

    componentDidMount() {
        if ( this.props.loadDataOnMount) {
            this.reloadGrid();
        }

        if (isNull(this.props.lookupManagerParameter)) {
            let ids: string[] =    this.lookupManager.getLookupIds();
            if (ids.length > 0) {
                this.lookupManager.loadFromCacheAndGenerateLookupRequest((resp: CommonCommunicationData.LookupRequestData[]) => {
                    this.lookupManager.requestLookupData({
                        dataIdAsString: null!,
                        modelName: null!,
                        onLookupAccepted: (lks: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => {
                            //
                        }
                    });
                });
            }
        }
    }
    /**
     * worker untuk submit query dan reload grid data
     */
    reloadGrid () {
        this.navigate(0);
    }
    /**
     * meminta lookup container yang di pakai grid
     */
     getLookupContainer (): {[id: string]: CommonCommunicationData.CommonLookupValue[]} {
         if (isNull(this.props.lookupManagerParameter)) {
             return null! ; 
         }
         return this.props.lookupManagerParameter!.lookDataContainer! ;
     }
    /**
     * where standard. bukan dalam include models
     */
    generateWhere(): any {
        let w: any =  !isNull(this.props.predefinedWhere) ? this.generateObjectClone( this.props.predefinedWhere) : {};
        let keys: string[] = Object.keys(this.whereFromInput); 
        for (let k of keys) {
            w[k] = this.whereFromInput[k];
        }
        return w; 

    }
    generateIncludeModelParams(): CommonCommunicationData.IncludeModelParam[] {
        let rtvl: CommonCommunicationData.IncludeModelParam[] = [] ;
        if ( !isNull( this.props.includeModelParams) && this.props.includeModelParams!.length > 0 ) {
            for ( let n of this.props.includeModelParams!) {
                rtvl.push(this.generateObjectClone(n));
            }
        } 
        for ( let onInc of this.whereOnIncludeFromInput ) {
            let matchFound: boolean = false ; 
            for ( let exst of rtvl) {
                if ( onInc.modelName === exst.modelName && onInc.as === exst.as) {
                    if ( !isNull(onInc.where)) {
                        if (isNull( exst.where) ) {
                            exst.where = {} ; 
                        }
                        this.copyFields(onInc.where , exst.where);
                    }
                    matchFound = true ; 
                }
            }
            if ( !matchFound) {
                rtvl.push(onInc);
            }
        }
        return rtvl === null || rtvl.length === 0 ? null! : rtvl ; 
    }

    generateObjectClone (baseObject: any ): any {
        if ( isNull(baseObject)) {
            return null ; 
        }
        let rtvl: any  = {} ; 
        if ( Array.isArray(baseObject) ) {
            rtvl = [] ; 
            rtvl.push(...baseObject);
        } else {
            this.copyFields(baseObject , rtvl);
        }
        return rtvl ; 
    }

    /**
     * state dari grid
     * @param rowIndex 
     */
    getGridRowState ( rowIndex: number ) {
        if ( isNull( this.state.rowStateContainer) || rowIndex < 0 || rowIndex >= this.state.rowStateContainer.length) {
            return null ; 
        }
        return this.state.rowStateContainer[rowIndex];
    }
    copyFields (source: any , destination: any ) {
        let keys: string [] = Object.keys(source) ; 
        for ( let k of keys ) {
            let v: any = source[k] ;
            if (isNull(v)) {
                // sebelumnya ini di delete. ini membuat query menjadi error
                destination[k] = null; 
                // delete destination[k]  ; 
            } else {
                if ( Array.isArray(v)) {
                    destination[k] = [] ; 
                    destination[k].push(...v);
                } else if ( typeof v === 'object') {
                    // let d : Date = null ; 
                    // d.getTime()
                    if ( !isNull(  v.getTime)) {
                        destination[k] = v ; 
                    }
                    let nextLvl: any = {} ; 
                    this.copyFields(v , nextLvl); 
                    destination[k] = nextLvl ;
                } else {
                    destination[k] = v ; 
                }
            }
             
        }
    }
    /**
     * handler kalau data sudah di terima
     * @param d  data dari server
     * @param param parameter paging dll
     */
    __onDataRequestSuccess   (d: CommonCommunicationData.PagedDataRequestResult<DATA> , param: CommonCommunicationData.PagedDataRequest<DATA>) {
        this.setStateHelper ( st => {
            if ( !isNull(this.props.handlerBeforeDataRenderToRows)) {
                let s: any = d ; 
                this.props.handlerBeforeDataRenderToRows!(s);
            }
            let pgSize: number = this.getSelectedPageSize() ;
            st.data = d.rows ; 
            st.rowStateContainer = [] ; 
            if ( !isNull(d.rows) && d.rows.length > 0) {
                let gen:  (data: DATA , rowIndex: number ) => any = !isNull(this.props.generatorInitialRowStateData) ? this.props.generatorInitialRowStateData! :  (data: DATA , rowIndex: number ) => {
                    return {}; 
                };
                for ( let i = 0 ; i < d.rows.length; i++) {
                    st.rowStateContainer.push(  gen(d.rows[i] , i ) );
                }
            }
            st.gridDataJoinedLookups = {} ;
            if  ( !isNull(d.lookups) ) {
                let keys: string [] = Object.keys(d.lookups) ; 
                for ( let k of keys) {
                    let lks: CommonCommunicationData.CommonLookupValue[] = d.lookups[k];
                    let r: any = {} ;
                    st.gridDataJoinedLookups[k] = r ; 
                    if ( !isNull(lks)) {
                        for  ( let l of lks) {
                            r[l.detailCode!] = l ;
                        }
                    }
                }
            } 
            st.totalDataCount = d.count! ; 
            st.pagePosition = param.page ; 
            st.totalPageCount = Math.ceil(d.count! / pgSize);
            st.latestCount = d.count!;
            if ( !isNull(this.props.onDataRecievied)) {
                this.props.onDataRecievied!(param.where , d) ;   
            }
        });
    }
    /**
     * navigate ke halaman yang di minta
     */
    navigate:  ( page: number ) => any =   ( page: number ) => {
        let pgSize: number = this.getSelectedPageSize() ;
        let param: CommonCommunicationData.PagedDataRequest<DATA> = {
            modelName : this.props.modelName , 
            includeModels : this.generateIncludeModelParams() , 
            orders : this.props.sorts , 
            pageSize: pgSize   ,
            page: page,
            where: this.generateWhere(), 
            latestCount : this.state.latestCount, 
            lookupFields : this.state.lookupFields
        };
        let successHandler:  (d: CommonCommunicationData.PagedDataRequestResult<DATA>) => any = (d: CommonCommunicationData.PagedDataRequestResult<DATA>) => {
            this.__onDataRequestSuccess(d , param);
        };
        let failHandler:  (code: string , message: string , exc: any ) => any = (code: string , message: string , exc: any ) => {
            console.error('[SimpleDbDrivenGridWithSimpleTable] navigate gagal proses data , error : ' , exc)  ; 
            this.setStateHelper ( st2 => {
                st2.pagePosition =  0 ;
                st2.data = [] ; 
                st2.rowStateContainer = [] ; 
                st2.gridDataJoinedLookups = {};
                st2.totalPageCount = 0  ; 
                st2.totalDataCount = 0 ;
                st2.latestCount = null!;
                if ( !isNull(this.props.onRequestDataFailHandler)) {
                    this.props.onRequestDataFailHandler!(code, message , exc) ; 
                }
            }); 
            
        };
        if ( !isNull(this.props.customDataLoader)) {
            this.props.customDataLoader!(param)
                .then(successHandler ).catch( exc => {
                    let code: string = exc.erorrCode ; 
                    let  message: string = exc.message   ; 
                    failHandler(code , message , exc ) ; 
                }) ;
        } else {
            this.coreAjaxUtils.getPagedDataWithPromise(param , 'SimpleDbDrivenGridWithSimpleTable' ) 
                .then( successHandler)
                .catch( exc => {
                    let code: string = exc.erorrCode ; 
                    let  message: string = exc.message   ; 
                    failHandler(code , message , exc ) ; 
                }) ;
        }
        
    }

    /**
     * formater money
     * @param useDotThousandSeparator  separator thousand
     * @param remainFraction 
     */
    generateSimpleCurrencyFormatter (useDotThousandSeparator: boolean , remainFraction: number ): GridColumnCustomTextFormatterMethod<DATA> {
        return (param: GridColumnCustomTextFormatterParameter<any>) => {
            try {
                return this.formatterUtils.formatMoney(param.originalLabel , useDotThousandSeparator , remainFraction);
            } catch ( exc) {
                return param.originalLabel ; 
            }
        };
    }

    /**
     * ini merender grid dengan basic table biasa
     */
    render(): JSX.Element {

        let rows: any[] = [];
        let pnl1: JSX.Element = this.generateFirstRowPanel();
        if (!isNull(pnl1)) {
            rows.push(pnl1);
        }
        let idx: number = 1;
        let datas: DATA[] = this.getGridData();
        if (!isNull(datas)) {
            for (let d of datas) {
                rows.push(this.rendererTaskRowGenerator(idx, d , this.props.rowClickHandler  , this.state.gridDataJoinedLookups)); 
                let subRows: any[]  =  this.populateSubRow( d , idx ) ; 
                if ( !isNull(subRows) && subRows.length > 0) {
                    rows.push(...subRows);
                }
                idx++;
            }
        }
        let headerCol: JSX.Element[] = [];
        let i: number = 1;
        for (let c of this.state.columnDefinitions) {
            if ( !isNull(c.onlyRenderedFlag) && c.onlyRenderedFlag  !== ColumnRenderFlag.both && c.onlyRenderedFlag !== ColumnRenderFlag.simpleGridOnly ) {
                continue ; 
            }
            if ( !isNull(c.onlyRenderedFlag) && c.onlyRenderedFlag === ColumnRenderFlag.scrollableOnly ) {
                continue ;
            }
            if (!isNull(c.customGridHeaderFormatter)) {
                headerCol.push(c.customGridHeaderFormatter!());
            } else {
                if (!isNull(c.width)) {
                    headerCol.push(<th style={{ width : c.width + this.props.columnWidthUnit}} key={'header_col_' + i} className={c.gridHeaderCssname}>{c.label}</th>);
                } else {
                    headerCol.push(<th key={'header_col_' + i} className={c.gridHeaderCssname}>{c.label}</th>);
                }
            }
            i++;
        }
        let virtualLookups: any[] = [];
        if (isNull(this.props.lookupManagerParameter) && !isNull(this.props.lookupCodes) && this.props.lookupCodes!.length > 0) {
            for (let lookupCode of this.props.lookupCodes!) {
                virtualLookups.push((
                <VirtualLookupComponent
                    key={lookupCode}
                    lovId={lookupCode}
                    lookupManager={this.lookupManager}
                    assignLookupData={(code: string, lookups: CommonCommunicationData.CommonLookupValue[]) => {
                        this.setStateHelper ( st => st.lookDataContainer[code] = lookups) ; 
                    } }
                />));
            }
        }

        let dispStyle: any = {};
        if (!isNull(this.props.hidden) && this.props.hidden) {
            dispStyle.display = 'none';
        }
        return (
        <table 
            className={this.props.cssName}
            id={this.props.tableId}
            style={dispStyle}
            ref={ d => {
                this.tableRef = d! ; 
            }}
        >
            <thead key='head'>
                <tr style={{ display: 'none' }} key='place_holder_column_def_tr'><td key='place_holder_column_def_td'>{this.props.children}{virtualLookups}</td></tr>
                <tr className={this.props.theadCssName} key='header_row'>
                    {headerCol}
                </tr>
            </thead>
            <tbody 
                key='body' 
                id={this.tbodyId}
                style={{display : this.state.viewState !== 'normal' ? 'none'  : ''}}
            >
                {rows}
            </tbody>
            {( () => {
                if ( this.state.viewState === 'modal-on-content') {
                    return (
                    <tbody>
                        <tr >
                            <td colSpan={this.state.columnDefinitions.length}>
                                <div style={{minHeight : this.state.blockingPanelParameter!.panelHeight + 'px'}}>
                                {this.state.blockingPanelParameter!.insideGridBlockPanels}
                                </div>
                                
                            </td>
                        </tr>
                    </tbody>
                    );
                }
                return null ; 
            })()}

            {this.rendererTaskFooter()}

        </table>
        );
    }

    /**
     * panel untuk row ke 1. ini misal untuk search panel
     */
    generateFirstRowPanel(): JSX.Element {
        if (!isNull(this.props.generate1stRowPanel)) {
            let lkMgr: ListOfValueManager = isNull(this.props.lookupManagerParameter) ? this.lookupManager : this.props.lookupManagerParameter!.lookupManager;
            return this.props.generate1stRowPanel!(this.assignQueryHandler, this.assignQueryOnIncludeModel, this.reloadGrid.bind(this), this.lookupDataContainer, lkMgr);
        } else {
            if (this.state.haveHeaderColumnSearchParameters) {
                return this.rendererTaskSearchHeaderPanelRow(); 
            }
            return null!;
        }
    }
    /**
     * page sizes yang tersedia dalam data
     */
    getPageSizes(): number[] {
        if (!isNull(this.props.pageSizeParam)) {
            return this.props.pageSizeParam!.pageSizes;
        }
        return SimpleDbDrivenGridWithSimpleTable.DEFAULT_PAGE_SIZES; 

    }
    /**
     * page size yang di pilih
     */
    getSelectedPageSize(): number {
        let pgs: number[] = this.getPageSizes();
        let pgSizeSel: number = pgs[0];
        if (this.state.selectedPageSizeIndex >= 0 && this.state.selectedPageSizeIndex < pgs.length) {
            pgSizeSel = pgs[this.state.selectedPageSizeIndex];
        }
        return pgSizeSel; 
    }
    /**
     * worker untuk render footer 
     */
    rendererTaskFooter(): JSX.Element {
        let pgs: number[] = this.getPageSizes();
        let pgSizeSel: number = pgs[0];
        if (this.state.selectedPageSizeIndex >= 0 && this.state.selectedPageSizeIndex < pgs.length) {
            pgSizeSel = pgs[this.state.selectedPageSizeIndex];
        }
        let r: any [] = isNull(this.props.generateFooterRowPanels) ? [] : this.props.generateFooterRowPanels!( this.state.totalDataCount  , this.state.pagePosition , this.state.data , this.lookupDataContainer , this.lookupManager);
        return  (
        <tfoot key='footer'>
            {r}
            <tr>
                <td  key={'row_footer_' + this.props.tableId} colSpan={this.state.columnDefinitions.length}>
                    <PagingControl
                        totalPage={this.state.totalPageCount}
                        page={this.state.pagePosition}
                        navigate={(page: number ) => {
                            this.navigate(page);
                        } }
                        pageSize={pgSizeSel}
                        pageSizes={pgs}
                        onPageSizeChange={(pgBaru: number) => {
                            let idxBaru: number = 0;
                            for (let i = 0; i < pgs.length; i++) {
                                if (pgs[i] === pgBaru) {
                                    idxBaru = i; 
                                    break; 
                                }
                            }
                            if (this.state.selectedPageSizeIndex !== idxBaru) {
                                this.setStateHelper ( 
                                    st => st.selectedPageSizeIndex = idxBaru  , 
                                    () => this.navigate(0));
                            }
                        } }
                        pagerDisplayed={isNull(this.props.pagingConfiguration) ? this.numberOfPagerDisplayed : this.props.pagingConfiguration!.numberOfPagerDisplayed}
                        limitDisplayedPage={isNull(this.props.pagingConfiguration) ? this.limitDisplayedPage : this.props.pagingConfiguration!.limitDisplayedPage}
                    />
                </td>
            </tr>
        </tfoot>
        );

    }

    /**
     * worker generate #1 row untuk predefined search
     */
    private rendererTaskSearchHeaderPanelRow(): JSX.Element {

        let lkMgr: ListOfValueManager = isNull(this.props.lookupManagerParameter) ? this.lookupManager : this.props.lookupManagerParameter!.lookupManager;

        let searchCols: any[] = [];
        let searchParam: CustomSearchPanelGeneratorParameter = {
            lookupManager : lkMgr , 
            lookupContainer : !isNull(this.props.lookupManagerParameter) ? this.props.lookupManagerParameter!.lookDataContainer : this.state.lookDataContainer , 
            assignQueryHandler : this.assignQueryHandler , 
            assignQueryOnIncludeModel : this.assignQueryOnIncludeModel
        };
        for (let idxCol = 0; idxCol < this.state.columnDefinitions.length; idxCol++) {
            let colDef: GridColumnProps<DATA> = this.state.columnDefinitions[idxCol] ; 
            if ( !isNull(colDef.onlyRenderedFlag) && colDef.onlyRenderedFlag !== ColumnRenderFlag.both && colDef.onlyRenderedFlag !== ColumnRenderFlag.simpleGridOnly ) {
                continue ; 
            }
            let searchDef: GridHeaderSearchDefinition = this.state.headerColumnSearchParameters[idxCol];
            let colHeaderTitle: string =  this.state.columnDefinitions[idxCol].label ; 
            if (isNull(searchDef)) {
                searchCols.push(<td key={'automated_first_row_' + idxCol}/>);
            } else {
                let rs: any[] = []; 
                if (!isNull(searchDef.customSearchPanelGenerator)) {
                    // rs.push(searchDef.customSearchPanelGenerator( lkMgr, this.assignQueryHandler, this.assignQueryOnIncludeModel ));
                    rs.push(searchDef.customSearchPanelGenerator!(searchParam));
                } else {
                    let sb: any = this.rendererTaskGenerateStandardSearchEntry( searchDef, colHeaderTitle  , 'automated_search_' + idxCol);
                    if (!isNull(sb)) {
                        rs.push(sb);
                    }
                }
                searchCols.push(<td key={'automated_first_row_' + idxCol}>{rs}</td>);
            }
        }
        return <tr key={this.props.tableId + '_search_panel'}>{searchCols}</tr>; 
    }

    private renderSelect2QueryPanel (searchDef: GridHeaderSearchDefinition, key: string , assignStandardField: (pr: SimpleQueryOperatorInputProps) => any ): JSX.Element  {
        let pS2: QuerySelect2Props = {
            assignQueryHandler: this.assignQueryHandler!,
            assignQueryOnIncludeModel: this.assignQueryOnIncludeModel!,
            queryField: searchDef.queryField!,
            dropDownContainerPanelId : searchDef.select2ContainerId! , 
            lookupParameter: {
                lookupManager: this.lookupManager!,
                lovId: searchDef.lookupId!
            }
        };
        let swap: any = searchDef.additonalControlMetadata ;  
        let select2Metadata: GridSearchData.Select2SearchMetadata = swap ; 
        if ( !isNull(select2Metadata)) {
            pS2.changeHandler = select2Metadata.changeHandler ; 
            pS2.appendNoneSelected = select2Metadata.appendNoneSelected ; 
            pS2.comboLabelFormater = select2Metadata.comboLabelFormater ; 
            pS2.dataFilter = select2Metadata.dataFilter ;
            pS2.isNumericValue = select2Metadata.isNumericValue ; 
            pS2.tabIndex = select2Metadata.tabIndex ; 
        }
        let s: any = pS2;
        assignStandardField(s);
        return <QuerySelect2 key={key} {...pS2}/>;
    }

    /**
     * render datepicker control
     * @param searchDef 
     * @param key 
     * @param assignStandardField 
     */
    private renderDatePickerQueryDatePicker(searchDef: GridHeaderSearchDefinition, key: string , assignStandardField: (pr: SimpleQueryOperatorInputProps) => any ): JSX.Element  {
        let swap: any = searchDef.additonalControlMetadata ;  
        let pDateMetadata: GridSearchData.DatePickerSearchMetadata = swap ; 
        let pDate: QueryDateTextboxProps = {
            assignQueryHandler: this.assignQueryHandler!,
            assignQueryOnIncludeModel: this.assignQueryOnIncludeModel!,
            queryField: searchDef.queryField!,
            queryOperator: searchDef.queryOperator !, 
        };
        if  ( !isNull(pDateMetadata)) {
            pDate.initialSearchValue = pDateMetadata.initialSearchValue ; 
            pDate.changeHandler = pDateMetadata.changeHandler ; 
            pDate.className = pDateMetadata.className ; 
            pDate.tabIndex = pDateMetadata.tabIndex ; 
        }
        let s: any = pDate;
        
        assignStandardField(s);
        return <QueryDateTextbox key={key} {...pDate}/>;
    }

    /**
     * render search control berupa texbox
     * @param searchDef definisi search
     * @param key key untuk memaksa unik dari control
     * @param assignStandardField  wokrer untuk assign standard property 
     */
    private renderTextboxSearchQueryTextbox (searchDef: GridHeaderSearchDefinition, key: string , assignStandardField: (pr: SimpleQueryOperatorInputProps) => any ): JSX.Element  {
        let swap: any = searchDef.additonalControlMetadata ;  
        let txtAddProps: GridSearchData.TextboxSearchMetadata = swap ; 
        let initSrc: any = null  ; 
        let p: QueryTextboxProps = {
            assignQueryHandler: this.assignQueryHandler!,
            assignQueryOnIncludeModel: this.assignQueryOnIncludeModel!,
            queryField: searchDef.queryField!,
            queryOperator: isNull(searchDef.queryOperator) ? SimpleQueryOperator.EQUAL : searchDef.queryOperator!, 
            
        };
        if ( !isNull(txtAddProps)) {
            p.textSearchMultipleValueParameterConfig  =  txtAddProps.textSearchMultipleValueParameterConfig   ; 
            initSrc = txtAddProps.initialSearchValue ; 
            p.className = txtAddProps.className ; 
            p.doNotIncludeWhenBlank = txtAddProps.doNotIncludeWhenBlank ; 
            p.style = txtAddProps.style ; 
            p.tabIndex = txtAddProps.tabIndex ; 
            p.className = isNull(txtAddProps.className) || txtAddProps.className!.length === 0 ?   BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX : txtAddProps.className  ; 
            
        } else {
            if ( !isNull(BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX) && BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX.length > 0 ) {
                p.className = BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX;
            }
        }
        assignStandardField(p);
        if (searchDef.searchType === GridHeaderSearchType.NUMBER_TEXTBOX) {
            p.useNumber = true;
        }
        if ( isNull(p.style)) {
            p.style = {} ; 
        }
        p.style!.width = '100%';
        p['key'] = key;
        p.initialSearchValue = initSrc ; 
        return <QueryTextbox key={key}  {...p} />;
    }
    /**
     * worker untuk membuat search standard
     * @param searchDef definisi search. diambil dari this.headerColumnSearchParameters
     * @param key key untuk mengindari react teriak
     * @param columnHeaderTitle title pada header column
     */
    private rendererTaskGenerateStandardSearchEntry(searchDef: GridHeaderSearchDefinition , columnHeaderTitle: string  , key: string): JSX.Element  {
        if ( !isNull(searchDef.doNotRenderIf) && searchDef.doNotRenderIf ) {
            return null ! ; 
        }
        let assignStandardField: (pr: SimpleQueryOperatorInputProps) => any = (pr: SimpleQueryOperatorInputProps) => {
            if (!isNull(searchDef.searchOnJoinDefinition)) {
                pr.includeModelName = searchDef.searchOnJoinDefinition!.modelName!;
                pr.isQueryOnIncludeModel = true;
                pr.includeAs = searchDef.searchOnJoinDefinition!.includeAs!;
            }
            pr.reloadGridMethod = () =>  this.reloadGrid() ;
        }; 

        if (searchDef.searchType === GridHeaderSearchType.TEXTBOX || searchDef.searchType === GridHeaderSearchType.NUMBER_TEXTBOX || searchDef.searchType === GridHeaderSearchType.EMAIL_TEXTBOX) {

            /*let p: QueryTextboxProps = {
                assignQueryHandler: this.assignQueryHandler,
                assignQueryOnIncludeModel: this.assignQueryOnIncludeModel,
                queryField: searchDef.queryField,
                queryOperator: isNull(searchDef.queryOperator) ? SimpleQueryOperator.EQUAL : searchDef.queryOperator , 
                textSearchMultipleValueParameterConfig : searchDef.textSearchMultipleValueParameterConfig
                
            };
            if (!isNull(SimpleDbDrivenGridWithSimpleTable.DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME) && SimpleDbDrivenGridWithSimpleTable.DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME.length > 0) {
                p.className = SimpleDbDrivenGridWithSimpleTable.DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME; 
            }
            assignStandardField(p);
            if (searchDef.searchType == GridHeaderSearchType.NUMBER_TEXTBOX) {
                p.useNumber = true;
            }
            p['key'] = key;
            p.initialSearchValue = initSrc;
            return <QueryTextbox key={key}  {...p} ></QueryTextbox>*/
            return this.renderTextboxSearchQueryTextbox(searchDef , key , assignStandardField) ; 
        } else if (searchDef.searchType === GridHeaderSearchType.DATE_FROM_TO) {
            let pDateFromTo: QueryDateTextboxFromAndToProps = {
                assignQueryHandler: this.assignQueryHandler,
                assignQueryOnIncludeModel: this.assignQueryOnIncludeModel,
                queryField: searchDef.queryField
            };
            let s: any = pDateFromTo;
            assignStandardField(s);

            return (
            <QueryDateTextboxFromAndTo
                key={key}
                {...pDateFromTo}
            />);
        } else if (searchDef.searchType === GridHeaderSearchType.DATE_PICKER) {
            /*let pDate: QueryDateTextboxProps = {
                assignQueryHandler: this.assignQueryHandler,
                assignQueryOnIncludeModel: this.assignQueryOnIncludeModel,
                queryField: searchDef.queryField,
                queryOperator: searchDef.queryOperator 
            };
            let s: any = pDate;
            pDate.initialSearchValue =initSrc ; 
            assignStandardField(s);
            return <QueryDateTextbox key={key}
                {...pDate}/>;*/
            return this.renderDatePickerQueryDatePicker(searchDef , key , assignStandardField) ;
        }  else if  ( searchDef.searchType === GridHeaderSearchType.SIMPLE_COMBOBOX ) {
            let pCmb: QuerySimpleComboBoxProps = {
                assignQueryHandler: this.assignQueryHandler!,
                assignQueryOnIncludeModel: this.assignQueryOnIncludeModel!,
                queryField: searchDef.queryField!,
                lookupParameter: {
                    lookupManager: this.lookupManager!,
                    lovId: searchDef.lookupId!
                }
            };
            let s: any = pCmb;
            pCmb.appendNoneSelected = true ; 
            pCmb.noneSelectedLabel = QuerySimpleComboBox.NONE_SELECTED_LABEL ;
            assignStandardField(s);
            return <QuerySimpleComboBox {...pCmb}/>;
        } else if (searchDef.searchType === GridHeaderSearchType.SELECT2) {
            /*let pS2: QuerySelect2Props = {
                assignQueryHandler: this.assignQueryHandler,
                assignQueryOnIncludeModel: this.assignQueryOnIncludeModel,
                queryField: searchDef.queryField,
                dropDownContainerPanelId : searchDef.select2ContainerId , 
                lookupParameter: {
                    lookupManager: this.lookupManager,
                    lovId: searchDef.lookupId
                }
            };
            let s: any = pS2;
            pS2.initialSearchValue =initSrc ; 
            assignStandardField(s);
            return <QuerySelect2 key={key} {...pS2}/>;*/
            return this.renderSelect2QueryPanel(searchDef , key , assignStandardField);

        } else if ( searchDef.searchType === GridHeaderSearchType.MULTIPLE_SELECTION) {
            return (
            <GridMultipleSelectSearchEntryPanel 
                assignQueryHandler={this.assignQueryHandler!}
                assignQueryOnIncludeModel={this.assignQueryOnIncludeModel!}
                navigate={this.navigate}
                putPanelInsideGridCommand={this.putPanelInsideGridCommand}
                searchDef={searchDef}
                removeQueryHandler={this.removeQueryHandler}
                removeQueryOnIncludeModel={this.removeQueryOnIncludeModel}
                key={key}
                columnTitle={columnHeaderTitle}
                lookupContainers={this.lookupDataContainer}
                lookupManager={this.lookupManager}
                lovId={searchDef.lookupId!}
            />
            );
        }
        return null!;
    }
    
    private __subComponentAppender (processedRow: any, targetState: SimpleDbDrivenGridWithSimpleTableState<DATA>) {
        if (!isNull(processedRow.props.customDataFormatter) || !isNull(processedRow.props.customDataFormatter) || !isNull(processedRow.props.defaultLabel)) {
            let d: GridColumnDbProps<DATA> = processedRow.props;
            console.log('[SimpleDbDrivenGridWithSimpleTable] memproses column def : ' , d);
            let lbl: string = d.defaultLabel;
            if ( !isNull( d.i18nKey) && d.i18nKey!.length > 0) {
                lbl = i18n(d.i18nKey! , lbl);
            }
            let sFormatter: any = d.customValueFormatter;
            if (!isNull(d.doNotRenderIf) && d.doNotRenderIf) {
                return; 
            }
            
            let b: GridColumnProps<DATA> = {
                hidden : d.hidden , 
                align: d.align,
                customDataFormatter: d.customDataFormatter,
                customGridHeaderFormatter: d.customGridHeaderFormatter,
                dateValueFormatter: d.dateValueFormatter,
                fieldName: d.fieldName,
                gridHeaderCssname: d.gridHeaderCssname,
                label: lbl,
                numberAsCurrencyFormatter: d.numberAsCurrencyFormatter,
                rowCssNameProvider: d.rowCssNameProvider,
                width: d.width,
                customValueFormatter: sFormatter,
                customColumnStyleProvider: d.customColumnStyleProvider , 
                scrollableColumnParam : d.scrollableColumnParam ,
                searchDefinition : d.searchDefinition  , 
                lookupParameter : d.lookupParameter,
                doNotRenderIf : d.doNotRenderIf , 
                onlyRenderedFlag : d.onlyRenderedFlag
                
            };
            if ( (isNull(d.searchDefinition) || isNull(d.searchDefinition!.customSearchPanelGenerator)) &&  !isNull( processedRow.props.children   )) {
                b.searchDefinition   =  this.findSearchPanel(processedRow.props.children);
            }
            if ( !isNull(d.lookupParameter)  ) {
                if ( isNull(targetState.lookupFields)  ) {
                    targetState.lookupFields = [];
                }
                targetState.lookupFields!.push( {
                    fieldName : !isNull(d.lookupParameter!.lookupFieldName) ? d.lookupParameter!.lookupFieldName! :   d.fieldName , 
                    lookupCode : d.lookupParameter!.lookupId
                });
            }
            let key: string = 'sortable';
            if (!isNull(d.sortable)) {
                b[key] = d.sortable;
            }

            targetState.columnDefinitions.push(b);
            if (!isNull(d.searchDefinition)) {
                targetState.haveHeaderColumnSearchParameters = true;
                targetState.headerColumnSearchParameters[targetState.columnDefinitions.length - 1] = d.searchDefinition!;  
            }
        } else if (!isNull(processedRow.props.clickHandler)) {// berarti action button def
            let salinanBtn: GridButtonProps<DATA> = processedRow.props;
            if (!isNull(salinanBtn.doNotRenderIf) && salinanBtn.doNotRenderIf) {
                return;
            } 
            this.actionButtons.push(salinanBtn);
        }
    }

}