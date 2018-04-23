import * as React from 'react';
import {  isNull , FormatterUtils , cloneObjectMakeDateObjectStringVariable } from '../../../utils/index';
import { CommonCommunicationData , ListOfValueManager, deepCloneObject  } from 'core-client-commons/index';
import { ajaxhelper   } from '../../../utils/index';
import { DetachPanel  } from '../../OffscreenPanelContainer';
import { ListOfValueComponent } from '../../ListOfValueComponent';
import { BaseGridPanelProps , BaseGridPanelState , BaseGridPanel } from './JqBaseGridPanel';
import {  IDbDrivenGridPanel, GridColumnCustomTextFormatterMethod, GridColumnCustomTextFormatterParameter , 
    GridHeaderSearchIncludeModelNestedDefinition ,  AssignQueryOnJoinHandlerParameter } from '../SimpleGridMetadata';
import { JqGridHeaderPanel } from './JqGridHeaderPanel';
/**
 * props untuk db driven grid
 */
export interface JqDbDrivenGridPanelProps<DATA> extends BaseGridPanelProps<DATA>   {

    /**
     * handler pada saat data di terima
     * @param where where clause
     * @param data data dari paging
     */
    onDataRecievied ?: ( where: any  , data: CommonCommunicationData.GridDataRequestResponse<DATA>  ) => any  ;

    /**
     * handler pada saat data baru di terima dari server. sebelum di render
     */
    handlerBeforeDataRenderToRows ?: ( data: CommonCommunicationData.GridDataRequestResponse<DATA>) => any ; 
    /**
     * nama model
     */
    modelName: string;
    /**
     * where yang predefined
     */
    predefinedWhere?: any;
    /**
     * default sorting field. 
     */
    sorts?: Array<string[]>|Array<CommonCommunicationData.SortParamAssociated>;
    /**
     * definisi models untuk di baca. kalau misal memerlukan special query , join dsb
     */
    includedModels?: CommonCommunicationData.IncludeModelParam[];

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
     * data di load on init atau tidak
     */
    loadDataOnMount?: boolean;
    /**
     * nilai default 40(px), kalau perlu page size berbeda di set dengan variable ini
     */
    pagingTextboxWidth ?: number  ; 

    /**
     * custom data loader
     */
    customDataLoader ?: ( param: CommonCommunicationData.GridDataRequest ) => Promise<CommonCommunicationData.GridDataRequestResponse<DATA> > ; 
   
}

export interface JqDbDrivenGridPanelState<DATA> extends BaseGridPanelState<DATA> {

    /**
     * page berapa dari data yang di minta
     */
    page: number;
    /**
     * berapa total page yang tersedia dari hasil pembacaan terkahir
     */
    pageCount: number;
    /**
     * berapa total data dalam grid
     */
    dataCount: number;
    /**
     * page akan di ambil dari props. ini cuma menampung index dari item yang di pilih
     */
    pageSelectorIndex: number;
    /**
     * flag data sudah pernah di request atau belum. pada awal data belum di request, berarti tidak ada query sama sekali. tidak ada item untuk di tampii
     */
    dataRequestedFlag: boolean ; 
    /**
     * panel generator untuk kasus data tidak di tersedia
     */
    dataNotFoundInfoPanelGenerator ?: () => JSX.Element ; 
    /**
     * penanda state update. untuk di pakai dalam method updateState. karena update grid di check di batasi item apa saja yang berubah
     */
    stateUpdateMarker: number ; 
}

/**
 * panel untuk grid db driven data
 */
export class JqDbDrivenGridPanel<DATA> extends BaseGridPanel<DATA, JqDbDrivenGridPanelProps<DATA>, JqDbDrivenGridPanelState<DATA>> implements IDbDrivenGridPanel<DATA> {
   
    /**
     * field pembanding prop untuk pengecekan perubahan props
     */
    static KEYS_ONPROP_FOR_CHECK_SHOULD_UPDATE: Array<string> = ['spaceUsedOnLeftSide',	'spaceUsedOnRightSide',	'gridTitle',	'gridHeight',	'gridMinimumWidth',	'width',	'actionColumnTitle',	'actionColumnWidth',	'rowNumberParam.headerLabel',	'rowNumberParam.width',	'hidden',	'noVerticalScroll',	'minimumHeight',	'fetcherDataFromDataContainer'] ; 
    
    /**
     * key pada state untuk mengecek element perlu update atau tidak
     */
    static KEYS_ONSTATE_FOR_CHECK_SHOULD_UPDATE: Array<string> = ['listData', 'stateUpdateMarker', 	'selectedData',	'selectedRowindex',	'headerCollapsed',	'widthComputedColumn',	'showingLoadBlockerPanel']; 
    
    /**
     * pager default. kalau tidak di tentukan
     */
    static DEFAULT_PAGES: number[] = [15, 30, 45];
    
    /**
     * css untuk search pada header column. ini perlu di sesuaikan dengan masing masing aplikasi css standard untuk textbox
     */
    static DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME: string = null!;

    assignQueryHandler1: (field: string, whereValue: any) => any;

    ajaxUtils: ajaxhelper.AjaxUtils;

    /**
     * formatter default untuk grid
     */
    formatterUtils: FormatterUtils ; 
    /**
     * lookup manager. untuk akses langsung ke lookup 
     */
    lookupManager: ListOfValueManager; 

    /**
     * where holder pada model
     */
    private dynamicWhere: any;

    /**
     * key : pola = modelname[.]asname#modelname[.]asname kalau misal nested beberapa field akan di akses dengan ini 
     */
    private dynamicIncludeAssociationWhereHolder: { [id: string]: any } = {};
    constructor(props: JqDbDrivenGridPanelProps<DATA>) {
        super(props);
        this.dynamicWhere = {};
        this.ajaxUtils = ajaxhelper.generateOrGetAjaxUtils();
        this.lookupManager =  ListOfValueComponent.generateLookupManager( this.ajaxUtils , this.state.lookupContainers);
        this.formatterUtils = new FormatterUtils(); 
        if ( !isNull(props.pageSizeParam)) {
            let swapSt: any = this.state ; 
            swapSt.pageSelectorIndex = props.pageSizeParam!.defaultSelectedIndex;
        }
    }

    generateSimpleCurrencyFormatter(useDotThousandSeparator: boolean, remainFraction: number): GridColumnCustomTextFormatterMethod<DATA> {
        return (param: GridColumnCustomTextFormatterParameter<any>) => {
            try {
                return this.formatterUtils.formatMoney(param.originalLabel , useDotThousandSeparator , remainFraction);
            } catch ( exc) {
                return param.originalLabel ; 
            }
        };
    }
    shouldComponentUpdate(nextProps: JqDbDrivenGridPanelProps<DATA> , nextState: JqDbDrivenGridPanelState<DATA>) {
        if ( this.compareForShouldComponentUpdateStateOrProp(JqDbDrivenGridPanel.KEYS_ONPROP_FOR_CHECK_SHOULD_UPDATE , nextProps , this.props)  ||
            this.compareForShouldComponentUpdateStateOrProp(JqDbDrivenGridPanel.KEYS_ONSTATE_FOR_CHECK_SHOULD_UPDATE , nextState , this.state)) {
                return true ; 
        }
        return false ; 
    }

    updateState: () => void = () =>  {
        console.log('pertimbangkan untuk update state dengan spesifik');
        this.setStateHelper(st => st.stateUpdateMarker = st.stateUpdateMarker + 1);
    }
    /**
     * getter data current dari grid
     */
    getGridData(): DATA[] {
        return this.state.listData ; 
    }
    
    reloadGrid(): void {
        this.navigate(0); 
    }
    getRowStateData(rowIndex: number): { [id: string]: any; } {
        return this.state.rowStateContainer![rowIndex];
    }

    getPageSizes(): number[] {
        if ( isNull(this.props.pageSizeParam) || isNull(this.props.pageSizeParam!.pageSizes)) {
            return JqDbDrivenGridPanel.DEFAULT_PAGES ; 
        }
        return this.props.pageSizeParam!.pageSizes;
    }
    componentDidMount() {
        let autoLoad: boolean = true;
        if (!isNull(this.props.loadDataOnMount)) {
            autoLoad = this.props.loadDataOnMount!;
        }
        if (autoLoad) {
            this.requestDataFromServer();
        }
        let ids: string[] =  this.lookupManager.getLookupIds() ; 
        if (!isNull(ids) && ids.length > 0 ) {
            this.lookupManager.requestLookupDataWithLovIds(ids)
                .then( () => {
                    //
                })
                .catch(e => {
                    //
                });
        }
    }
    /**
     * navigasi halaman ke halaman di minta. 
     * @param page page yang di minta untuk di load
     */
    navigate: (page: number) => void = (page: number) => {
        this.setStateHelper( 
            stateBaru => {
                stateBaru.page = page ; 
                return stateBaru ; 
            } , 
            () => {
                this.requestDataFromServer();
            }); 
    }
    /**
     * membaca data lookup dengan id <strong>lookupId</strong> + value dari data yang hendak di baca
     * @param lookupId kkode lookup unutuk di baca
     * @param val value untuk di baca
     */
    getLookupData(lookupId: string, val: string): CommonCommunicationData.CommonLookupValue {
        let lks: CommonCommunicationData.CommonLookupValue[] = this.state.lookupContainers[lookupId];
        if (!isNull(lks)) {
            for (let l of lks) {
                if (l.detailCode === val) {
                    return l; 
                }
            }
        }
        return null!; 

    }

    /**
     * apply where pada where normal
     */
    assignQueryOptions   (queryParam: CommonCommunicationData.SimpleWrappedSearchParam   ) {
        if ( isNull(queryParam.where)) {
            this.dynamicWhere = {} ; 
        } else {
            this.dynamicWhere = queryParam.where; 
        }
        if (isNull( queryParam.includeModels) ) {
            this.dynamicWhere = {} ; 
        } else {
            for ( let l of queryParam.includeModels!) {
                if ( isNull(l.where)) {
                    continue ; 
                }
                let keys: string[] = Object.keys(l.where) ; 
                for ( let k of keys) {
                    this.assignQueryOnIncludeModel(l.modelName , k, l.where[k] , l.required!, l.as);
                }
            }
        }
        this.navigate(0);

    }
    /**
     * ini untuk menghandle page kalau ada perubahan pada textbox page
     */
    handleNavigatePageOnTextBoxEntry() {
        let val: any = document.getElementById("txt_pager_" + this.gridId)!['value'];
        if (isNull(val) || isNaN(val)) {
            console.error('[DbDrivenGridPanel]isian dari text pager kosong, silakan di cek');
            return;
        }
        val = parseInt(val, 10);
        if (val < 1) {
            console.error('[DbDrivenGridPanel] paging di masukan nilai negatif. di abaikan');
            return;
        }
        if (val > this.state.pageCount) {
            console.error('[DbDrivenGridPanel] page yang anda masukan melebihi. maksimal : ' + this.state.pageCount);
            return;
        }
        this.navigate(val - 1);
    }

    /**
     * pager sisi tengah. ini biasanya tempat pagin
     */
    rendererTaskFooterCenter(): JSX.Element {
        if (this.state.pageCount < 2) {
            return <input type='hidden' key={this.gridId + 'center_footer'} id={this.gridId + 'center_footer'} />;
        }
        let nextLastClassName: string = 'ui-pg-button ui-corner-all ';
        let prevClassName: string = 'ui-pg-button ui-corner-all ';
        if (this.state.page >= this.state.pageCount - 1) {
            nextLastClassName += 'ui-state-disabled';
        }
        if (this.state.page === 0) {
            prevClassName += 'ui-state-disabled';
        }

        return (
            <table cellSpacing={0} cellPadding={0}  style={{ tableLayout: 'auto', display: 'table' }} className="ui-pg-table">
                <tbody key={this.gridId + '_pager_tbody'}>
                    <tr key={this.gridId + '_pager_tbody_tr'}>
                        <td 
                            id={"first_" + this.gridId + "_pager"}
                            key={"first_" + this.gridId + "_pager"}
                            className={prevClassName}
                            onClick={() => {
                                if (this.state.page < 1) {
                                    return;
                                }
                                this.navigate(0);
                            } }
                        >
                            <span className="ui-icon ace-icon fa fa-angle-double-left bigger-140">{}</span>
                        </td>
                        <td 
                            id={"prev_" + this.gridId + "_pager"}
                            key={"prev_" + this.gridId + "_pager"}
                            className={prevClassName}
                            onClick={() => {
                                let nxtPage: number = this.state.page - 1;

                                if (this.state.page < 1) {
                                    return;
                                }
                                this.navigate(nxtPage);
                            } }
                        >
                            <span className="ui-icon ace-icon fa fa-angle-left bigger-140">{}</span>
                        </td>
                        <td 
                            key={"spacer_" + this.gridId + "_pager"}
                            style={{ width: '4px' }}
                            className="ui-pg-button ui-state-disabled" 
                        >
                            <span className="ui-separator">{}</span>
                        </td>
                        <td key={"page_input_" + this.gridId + "_pager"} dir="ltr">
                            Halaman
                            <input
                                key={"txt_pager_" + this.gridId + this.state.page}
                                id={"txt_pager_" + this.gridId}
                                className="ui-pg-input"
                                type="number"
                                min={1}
                                max={this.state.pageCount}
                                size={4}
                                style={{width : isNull(this.props.pagingTextboxWidth) ?  '40px' : this.props.pagingTextboxWidth + 'px'  }}
                                maxLength={7}
                                onChange={(evt: any) => {
                                    let valBaru: any = evt.target.value;
                                    console.warn('[DbDrivenGridPanel]val baru : ', valBaru);
                                    if (isNaN(valBaru)) {
                                        return;
                                    }
                                    if (valBaru < 1 || valBaru > this.state.pageCount) {
                                        return;
                                    }
                                    this.navigate(valBaru);

                                } }
                                value={(this.state.page + 1) + ''}
                                role="textbox" 
                            /> dari <span id={"sp_1_" + this.gridId + "_main_pager"}>{this.state.pageCount}</span>
                        </td>
                        <td className="ui-pg-button ui-state-disabled" style={{ width: '4px' }}>
                            <span className="ui-separator"/>
                        </td>
                        <td 
                            key={"next_" + this.gridId + "_pager"}
                            id={"next_" + this.gridId + "_pager"}
                            className={nextLastClassName}
                            onClick={() => {
                                if (this.state.page >= (this.state.pageCount - 1)) {
                                    return;
                                }
                                this.navigate(this.state.page + 1);
                            } }
                        ><span className="ui-icon ace-icon fa fa-angle-right bigger-140"/>
                        </td>
                        <td 
                            key={"last_" + this.gridId + "_pager"}
                            id={"last_" + this.gridId + "_pager"}
                            className={nextLastClassName}
                            onClick={() => {
                                if (this.state.page >= (this.state.pageCount - 1)) {
                                    return;
                                }
                                this.navigate(this.state.pageCount - 1);
                            } }
                        ><span className="ui-icon ace-icon fa fa-angle-double-right bigger-140"/>
                        </td>
                        <td 
                            key={"combobox_" + this.gridId + "_pager"}
                            id={"combobox_" + this.gridId + "_pager"} 
                            dir="ltr"
                        >{this.rendererTaskPageSizeCombo()}
                        </td>
                    </tr>
                </tbody>
            </table>
        );

    }
    /**
     * block panel
     */
    blockPanel(content: JSX.Element): DetachPanel {
        this.showLoadingPanel(content) ; 
        return () => {
            this.hideLoadingPanel();
        };
    }

    /**
     * ini untuk request ulang data dari server.via ajax
     */
    requestDataFromServer(): Promise<any> {
        return new Promise<any>( ( accept: (n: any) => any , reject: (exc: any) => any ) => {
            let pgs: number[] = JqDbDrivenGridPanel.DEFAULT_PAGES;
            if (!isNull(this.props.pageSizeParam)) {
                pgs = this.props.pageSizeParam!.pageSizes;
            }
            let gridWhere: any = {};
            if (!isNull(this.props.predefinedWhere)) {
                this.mergeObject(this.props.predefinedWhere, gridWhere);
            }
            this.mergeObject(this.dynamicWhere, gridWhere);
            if (Object.keys(gridWhere).length === 0) {
                gridWhere = null;
            }
            let pgSize: number = pgs[this.state.pageSelectorIndex];
            if ( isNull(pgSize)) {
                pgSize = 15 ; 
            }
            let sortParam: CommonCommunicationData.SortParam [] = [] ; 
            if ( this.props.sorts != null ) {
                for ( let s of this.props.sorts) {
                    let swapS: any = s ; 
                    if ( !isNull(swapS.fieldName) ) {
                        sortParam.push(swapS);
                    } else if (Array.isArray(s)) {
                        sortParam.push({ fieldName :  s[0] , asc :   s[1].toLowerCase() === 'asc' });
                    }
                }
            }
            let fixedWhere: any =  cloneObjectMakeDateObjectStringVariable(gridWhere) ; 
            let p: CommonCommunicationData.GridDataRequest = {
                modelName: this.props.modelName,
                page: this.state.page,
                pageSize: pgSize,
                includeModels: this.generateIncludeParams(),
                where: fixedWhere,
                lookupParams: this.generateLookupParams() , 
                sorts : sortParam
            };
            this.state['gridRequestParam'] = p ; 
            let detachPanel: DetachPanel  = this.blockPanel(<span>Meminta data ...</span>);
            let onDataRecieved: (data: CommonCommunicationData.GridDataRequestResponse<DATA> ) => any = (gridData: CommonCommunicationData.GridDataRequestResponse<DATA>) => {
                if ( !isNull(this.props.handlerBeforeDataRenderToRows)) {
                    this.props.handlerBeforeDataRenderToRows!(gridData); 
                }
                this.setStateHelper( 
                    stateBaru => {
                        stateBaru['rawGridData'] = gridData ; 
                        stateBaru.dataRequestedFlag = true ; 
                        stateBaru.selectedData = null!;
                        stateBaru.selectedRowindex = - 1;
                        stateBaru.dataCount = gridData.count!;
                        stateBaru.pageCount = Math.ceil(gridData.count! / pgSize);
                        stateBaru.rowStateContainer = []; 
                        stateBaru.lookupContainers = {};
                        stateBaru.gridDataJoinedLookups = {} ; 
                        stateBaru.showingLoadBlockerPanel = false ; 
                        this.assignData(gridData.rows! , true , stateBaru ) ; 
                        if (!isNull( p.lookupParams)) {
                            for ( let k of p.lookupParams!) {
                                let n: any = {} ; 
                                stateBaru.gridDataJoinedLookups[k.lookupCode] = n ; 
                                if ( !isNull(gridData.lookupsData [ k.lookupCode])) {

                                    for ( let scanLk of gridData.lookupsData[k.lookupCode]) {
                                        n[scanLk.detailCode!] = scanLk ; 
                                    }
                                }
                            }
                        }
                        return stateBaru ; 
                    } , 
                    () => {
                        if ( !isNull(this.props.onDataRecievied)) {
                            this.props.onDataRecievied!(gridWhere , gridData);
                        }
                    }
                );
                detachPanel();
                accept({});
            };
            if ( !isNull(this.props.customDataLoader)) {
                this.props.customDataLoader!(p )
                    .then( r => {
                        onDataRecieved(r);
                    })
                    .catch(reject);
            } else {
                this.ajaxUtils.post('/dynamics/commons/grid-data-provider.svc?sourceModule=JqDbDrivenGridPanel', {param: btoa(JSON.stringify(p))} )
                    .then(r => {
                        onDataRecieved(r);
                    })
                    .catch(excSimple => {
                        this.setStateHelper( 
                            stateBaru => {
                            stateBaru.showingLoadBlockerPanel = false ; 
                            return stateBaru ; 
                        });
                        reject(excSimple);
                    });
            }
        }); 
    }

    /**
     * generate lookup params
     */
    generateLookupParams(): CommonCommunicationData.LookupRequestForLookupOnListDataParam[] {
        let rtvl: CommonCommunicationData.LookupRequestForLookupOnListDataParam[] = [];
        for (let c of this.state.columnDefinitions) {
            if (!isNull(c.lookupParameter) && !isNull(c.lookupParameter!.lookupId) && c.lookupParameter!.lookupId.length > 0) {
                rtvl.push({
                    fieldName: c.fieldName,
                    lookupCode: c.lookupParameter!.lookupId
                });
            }
        }
        return rtvl;
    }
    /**
     * assign query untuk where. ada 2 macam where. where pada model, atau pada included association. bagian ini hanya mengurus pada where
     * @param key field untuk query 
     * @param queryValue value dari query. kalau null ini akan menghapus param query
     */
    assignQueryHandler: (key: string, queryValue: any) => any = (key: string, queryValue: any) => {
        if (isNull(queryValue)) {
            try { 
                delete this.dynamicWhere[key]; 
            } catch (exc) { console.error('[DbDrivenGridPanel] gagal hapus field : ', key, ' untuk query, error : ', exc); }
        } else {
            this.dynamicWhere[key] = queryValue;
        }
    }
    /**
     * handler tambahan untuk search pada join 
     * @param parameter parameter query 
     */
    assignQueryOnJoinHandler ( parameter: AssignQueryOnJoinHandlerParameter ) {
        if ( isNull(parameter.searchOnJoinDefinition.nestedJoinDefinition)) {
            this.assignQueryOnIncludeModel( parameter.searchOnJoinDefinition.modelName , parameter.queryField , parameter.value , parameter.searchOnJoinDefinition!.useInnerJoin! , parameter.searchOnJoinDefinition.includeAs) ; 
        }
    }
    /**
     * mencari search pada join . kalau belum ada maka akan di cretate
     * @param nestedJoinDefinition 
     */
    getOrGenerateIncludeModel ( nestedJoinDefinition: GridHeaderSearchIncludeModelNestedDefinition ): any  {
        let current: GridHeaderSearchIncludeModelNestedDefinition = nestedJoinDefinition ; 
        let fullPathCurrent: string = '' ;
        let currentWhere: any = null ; 
        do {
            let keyCurrent: string = current.modelName ; 
            if ( !isNull(current.asName) && current!.asName!.length > 0 ) {
                keyCurrent += '.' + current.asName  ; 
            }  
            fullPathCurrent += keyCurrent ; 
            currentWhere = this.dynamicIncludeAssociationWhereHolder[fullPathCurrent] ; 
            if ( !currentWhere) {
                currentWhere = {} ; 
                this.dynamicIncludeAssociationWhereHolder[fullPathCurrent] = currentWhere ;  
            }
            current = current.child! ; 
        }while ( !isNull(current)) ; 

    }
    /**
     * command untuk remove query
     */
    removeQueryHandler: (key: string ) => any = (key: string ) => {
        try { delete this.dynamicWhere[key]; 
        } catch (exc) { console.error('[DbDrivenGridPanel] gagal hapus field : ', key, ' untuk query, error : ', exc); }
    } 
    
    /**
     * untuk remove query pada include
     */
    removeQueryOnIncludeModel: (modelName: string , key: string ,      asName ?: string ) => any = (modelName: string, key: string ,      asName ?: string ) => {
        let keyInclude: string = modelName;
        if (!isNull(asName) && asName && asName.length > 0) {
            keyInclude = modelName + '.' + asName;
        }
        delete this.dynamicWhere[keyInclude] ;
    }

    /**
     * kosongkan semua where yang di assign sebelumnya. 
     * baik pada where standard, atau pada include
     */
    emptyWhere() {
        this.dynamicWhere = {};
        this.dynamicIncludeAssociationWhereHolder = {};
    }
    
    /**
     * worker untuk assign query ke dalam include dari 
     * @param key key dari query 
     * @param queryValue value untuk query 
     * @param modelName nama model dari object
     * @param asName kalau ada alias/as dar model object 
     */
    // (modelName :string ,fieldName : string ,  whereValue : any ,useInnerJoin : boolean, modelAs ? : string ) 
    assignQueryOnIncludeModel: (modelName: string , key: string ,     queryValue: any , useInnerJoin: boolean, asName ?: string ) => any = (modelName: string , key: string ,     queryValue: any , useInnerJoin: boolean, asName ?: string ) =>  {
        let keyInclude: string = modelName;
        if (asName && asName.length > 0) {
            keyInclude = modelName + '.' + asName;
        }
        if (isNull(this.dynamicIncludeAssociationWhereHolder[keyInclude])) {
            this.dynamicIncludeAssociationWhereHolder[keyInclude] = {};
        }
        if (isNull(queryValue)) {
            try {
                delete this.dynamicIncludeAssociationWhereHolder[keyInclude][key];
                let ln: number = Object.keys(this.dynamicIncludeAssociationWhereHolder[keyInclude]).length;
                if (ln === 0) {
                    delete this.dynamicIncludeAssociationWhereHolder[keyInclude];
                }
            } catch (exc) { console.error('[DbDrivenGridPanel] gagal hapus field : ', key, ' untuk query, error : ', exc); }
        } else {
            this.dynamicIncludeAssociationWhereHolder[keyInclude][key] = queryValue;
        }
    }
    /**
     * buat clone object dari inclide model
     * @param param 
     */
    makeIncludeModelParamClone (param:   CommonCommunicationData.IncludeModelParam[]): CommonCommunicationData.IncludeModelParam[] {
        if ( isNull(param ) ) {
            return null !; 
        }
        let rtvl:  CommonCommunicationData.IncludeModelParam[]   = [] ; 
        for ( let k of param ) {
            rtvl.push({ 
                as : k.as! ,
                modelName : k.modelName , 
                required : k.required , 
                where : deepCloneObject (k.where) , 
                includeModels : !(k.includeModels) ? null! : k.includeModels.map( p => {
                    return deepCloneObject(p);
                }) 
            });
        }
        return rtvl ; 
    }
    /**
     * generate include model param. ini untuk mengquery data
     */
    generateIncludeParams(): CommonCommunicationData.IncludeModelParam[] {
        let baseParam: CommonCommunicationData.IncludeModelParam[] = this.makeIncludeModelParamClone(this.props.includedModels!) ;  
        if (isNull(baseParam)) {
            baseParam = [];
        }
        let ln: number = Object.keys(this.dynamicIncludeAssociationWhereHolder).length;
        if (ln === 0) {
            if (baseParam.length === 0) {
                return null!;
            }
            return baseParam;
        }

        let indexer: { [id: string]: CommonCommunicationData.IncludeModelParam } = {};
        for (let inc of baseParam) {
            let k: string = inc.modelName;
            if (!isNull(inc.as) && inc.as!.length > 0) {
                k += '.' + inc.as;
            }
            indexer[k] = inc;
        }
        // lets merge
        let keys: string[] = Object.keys(this.dynamicIncludeAssociationWhereHolder);
        for (let k1 of keys) {
            this.plugToIncludeModelWhere(indexer, k1, baseParam);
        }
        if ( !isNull(baseParam) && baseParam.length > 0 ) {
            let salin: any [] =  baseParam.map( s => {
                return cloneObjectMakeDateObjectStringVariable(s) ;
            }); 
            baseParam = salin ; 
        }
        return baseParam ; 

    }
    getSelectedPageSize(): number {
        let pgs: number[] = JqDbDrivenGridPanel.DEFAULT_PAGES;
        if (!isNull(this.props.pageSizeParam) && !isNull(this.props.pageSizeParam!.pageSizes)) {
            pgs = this.props.pageSizeParam!.pageSizes;
        }
        let ps: number =  pgs[this.state.pageSelectorIndex];
        if ( isNull(ps) || isNaN(ps)) {
            ps = 15 ; 
        }
        return ps ; 
    }
    /**
     * starting row number . default = 1
     */
    getStartRowNumber(): number {
        if (this.state.page === 0) {
            return 1;
        }
        let pgSize: number = this.getSelectedPageSize();
        let rtvl: number = (pgSize * (this.state.page)) + 1;
        return rtvl;
    }
    generateDefaultState(): JqDbDrivenGridPanelState<DATA> {
        return {
            headerCollapsed: false,
            listData: null!,
            selectedData: null!,
            selectedRowindex: -1,
            page: 0,
            pageSelectorIndex: 0,
            pageCount: 0,
            dataCount: 0,
            gridButtons: [],
            lookupContainers: {},
            columnDefinitions : [] , 
            widthComputedColumn : 100 , 
            showingLoadBlockerPanel : false , 
            rowStateContainer : [] , 
            dataRequestedFlag : false  , 
            stateUpdateMarker : 1 
        };
    }

    /**
     * worker untuk membuat column headers rows 1.
     */
    rendererTaskGridColumnHeaders(gridWidth: number): JSX.Element {
        let colDefs: any = this.state.columnDefinitions ; 
        return (
        <JqGridHeaderPanel 
            gridWidth={gridWidth}
            assignQueryHandler={this.assignQueryHandler}
            assignQueryOnIncludeModel={this.assignQueryOnIncludeModel}
            columnDefinitions={colDefs}
            cssForSearchTextBox={JqDbDrivenGridPanel.DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME}
            gridId={this.gridId}
            key={'header_panel_db'}
            headerCollapsed={this.state.headerCollapsed}
            lookupContainers={this.state.lookupContainers}
            lookupManager={this.lookupManager}
            navigate={this.navigate}
            widthComputedColumn={this.state.widthComputedColumn}
            rowNumberParam={this.props.rowNumberParam}
            resizeColumnWidth={this.resizeColumnWidth}
            onChangeSort={this.onChangeSort}
            gridActualHeight={this.gridActualHeight}
            putPanelInsideGridCommand={this.putPanelInsideGridCommand}
            removeQueryHandler={this.removeQueryHandler}
            removeQueryOnIncludeModel={this.removeQueryOnIncludeModel}
        />); 
    }

    /**
     * gabung 2 object. salin property dari obj1 ke obj 2
     * @param source sumber data untuk salin ke dest
     * @param destination ke obj mana data akan di salin
     */
    mergeObject(source: any, destination: any) {
        if ( isNull(source) || isNull(destination)) {
            return ; 
        }
        let ks: string[] = Object.keys(source);
        for (let k of ks) {
            destination[k] = source[k];
        }
    }

    /**
     * helper untuk assign where ke dalam include
     * @param indexer 
     * @param whereKey 
     * @param predefinedIncludeCloned include param dari props, ini sudah di clone
     */
    private plugToIncludeModelWhere(indexer: { [id: string]: CommonCommunicationData.IncludeModelParam; }, whereKey: string, predefinedIncludeCloned: CommonCommunicationData.IncludeModelParam[]) {
        if ( whereKey.indexOf('#') >= 0) {
            if  ( isNull(predefinedIncludeCloned) || predefinedIncludeCloned.length === 0 ) {// predefined null, abaikan
                return ; 
            }
            let spl: string [] = whereKey.split('#') ; 
            let mdlName: string = null! ; 
            let mdlAs: string = null! ; 
            if ( spl[0].indexOf('.') >= 0) {
                let splL2: string[] = spl[0].split('.') ; 
                mdlName = splL2[0] ;
                mdlAs = splL2[1] ; 
            } else {
                mdlName = spl[0] ; 
            }
            let startInclude: CommonCommunicationData.IncludeModelParam = null! ; 
            for ( let c of predefinedIncludeCloned) {
                if ( c.modelName === mdlName && c.as === mdlAs ) {
                    startInclude = c ; 
                    break  ; 
                }
            }
            if ( isNull(startInclude)) {
                return ; 
            }
            let actualProc: CommonCommunicationData.IncludeModelParam = startInclude ; 
            if ( spl.length > 1 ) {
                for ( let i = 1 ; i < spl.length ; i++) {
                    if ( isNull(actualProc) ||  isNull(actualProc.includeModels) || actualProc.includeModels!.length === 0 ) { // tidak ada include abaikan
                        return  ; 
                    }
                    let mdlNameCurrent: string = null! ; 
                    let mdlAsCurrent: string = null! ; 
                    let currentPath: string = spl[i] ; 
                    if ( currentPath.indexOf('.') >= 0) {
                        let splCurrent: string [] = currentPath.split('.') ; 
                        mdlNameCurrent = splCurrent[0] ; 
                        mdlAsCurrent = splCurrent[1] ; 
                    } else {
                        mdlNameCurrent = currentPath ; 
                    }
                    let mtchFound: boolean = false ; 
                    for ( let x of actualProc.includeModels!) {
                        if ( x.modelName === mdlNameCurrent && x.as === mdlAsCurrent ) {
                            actualProc = x ; 
                            mtchFound = true ; 
                            break ; 
                        }
                    }
                    if ( !mtchFound) {
                        console.error('[JqDbDrivenGridPanel#plugToIncludeModelWhere] untuk key : ' , whereKey , '. anda perlu cek pada bagian include model param pada grid. mungkin ada yang salah') ; 
                    }
                }
            }
            if ( !isNull(actualProc)) {
                if ( isNull(actualProc.where)) {
                    actualProc.where = {} ; 
                }
                this.mergeObject(this.dynamicIncludeAssociationWhereHolder[whereKey], actualProc.where);
            }
            
        } else {
            let incParam: CommonCommunicationData.IncludeModelParam = indexer[whereKey];
            if (isNull(incParam)) {
                let modelName: string = whereKey;
                let asName: string = null!;
                if (whereKey.indexOf('.') >= 0) {
                    let spl: string[] = whereKey.split('.');
                    modelName = spl[0];
                    asName = spl[1];
                }
                incParam = {
                    modelName: modelName,
                    as: asName,
                    where: {}
                };
                indexer[whereKey] = incParam;
                predefinedIncludeCloned.push(incParam);
            }
            if (isNull(incParam.where)) {
                incParam.where = {};
            }
            this.mergeObject(this.dynamicIncludeAssociationWhereHolder[whereKey], incParam.where);
        }
        
    }

    /**
     * drop down page size. ini default berisi : 15, 30, 45 
     */
    private rendererTaskPageSizeCombo(): JSX.Element {
        let opts: any[] = [];
        let pgs: number[] = JqDbDrivenGridPanel.DEFAULT_PAGES;
        if ( !isNull(this.props.pageSizeParam) && !isNull(this.props.pageSizeParam!.pageSizes)) {
            pgs = this.props.pageSizeParam!.pageSizes;
        }
        let val: string = '';
        for (let iPgs = 0; iPgs < pgs.length; iPgs++) {
            if (this.state.pageSelectorIndex === iPgs) {
                val = pgs[iPgs] + '';
            }
            opts.push(<option key={'paging_value_' + (pgs[iPgs])} role="option" value={pgs[iPgs] + ''}>{pgs[iPgs] + ''}</option>);
        }
        return (
        <select
            key={this.gridId + '_page_sizes'}
            className="ui-pg-selbox"
            role="listbox"
            value={val}
            onChange={(evt: any) => {
                let selVal: string = evt.target.value;
                let idx: number = 0;
                let scanIdx: number = 0;
                for (let p of pgs) {
                    if (p + '' === selVal) {
                        idx = scanIdx;
                        break;
                    }
                    scanIdx++;
                }
                if (this.state.pageSelectorIndex !== idx) {
                    this.setStateHelper ( 
                        st => {
                            st.page = 0;
                            st.pageSelectorIndex = idx;
                        } , 
                        () => {
                            this.requestDataFromServer();
                        });
                    
                }
            } }
        >
            {opts}
        </select>);
    }

}