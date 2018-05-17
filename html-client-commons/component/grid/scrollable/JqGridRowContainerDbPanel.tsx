import * as React from 'react';
import { JqGridRowContainerBasePanel , JqGridRowContainerBasePanelProps , JqGridRowContainerBasePanelState } from './JqGridRowContainerBasePanel';
import { isNull , isSortExistOnArray ,  cloneObjectMakeDateObjectStringVariable ,  ajaxhelper } from '../../../utils/index';
import { DetachPanel  } from '../../OffscreenPanelContainer';
import { CommonCommunicationData } from 'core-client-commons';

export interface JqGridRowContainerDbPanelProps<DATA> extends JqGridRowContainerBasePanelProps<DATA> {
    /**
     * nama model
     */
    modelName: string;
    /**
     * where yang predefined
     */
    predefinedWhere?: any;
    /**
     * default sorting field. ini di set dari luar. default sort
     */
    sorts?: Array<string[]>|Array<CommonCommunicationData.SortParamAssociated>;

    /**
     * definisi lookup dalam field
     */
    lookupParams ?: CommonCommunicationData.LookupRequestForLookupOnListDataParam[] ; 
    /**
     * generator initial state untuk row(untuk keperluan sub row). misal anda perlu expand collapse panel
     * @param data data untuk di buatkan state nya
     * @param rowIndex index dari row untuk di render
     */
    generatorInitialRowStateData ?: (data: DATA , rowIndex: number ) => {[id: string]: any } ;
    /**
     * handler pada saat data di terima
     * @param where where clause
     * @param data data dari paging
     */
    onDataRecievied ?: ( where: any  , data: CommonCommunicationData.GridDataRequestResponse<DATA>  ) => any  ;
    /**
     * data di load on init atau tidak
     */
    loadDataOnMount?: boolean;
    /**
     * definisi models untuk di baca. kalau misal memerlukan special query , join dsb
     */
    includedModels?: CommonCommunicationData.IncludeModelParam[];
    /**
     * render panel blocking, ini untuk menandai data dalam proses loading
     */
    renderBlockPanel: ( panel: JSX.Element) => any ;

    /**
     * ukuran page di baca
     */
    pageSize: number  ; 
    /**
     * page berapa dari data yang di minta
     */
    page: number;

    /**
     * custom data loader
     */
   customDataLoader ?: ( 
       param: CommonCommunicationData.GridDataRequest, 
       onDataRecieved: (data: CommonCommunicationData.GridDataRequestResponse<DATA> ) => any ,
       onFailure: (code: string, message: string , exc: any ) => any ) => any ;

} 

export interface JqGridRowContainerDbPanelState<DATA>  extends JqGridRowContainerBasePanelState<DATA> {

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
    
} 
/**
 * panel row container db driven. termasuk request data di handle dengan panel ini
 * @author Gede Sutarsa
 */
export class JqGridRowContainerDbPanel<DATA> extends JqGridRowContainerBasePanel<DATA, JqGridRowContainerDbPanelProps<DATA>, JqGridRowContainerDbPanelState<DATA>> {
    /**
     * pager default. kalau tidak di tentukan
     */
    static DEFAULT_PAGES: number[] = [15, 30, 45];
    /**
     * untuk request ajax, glue class
     */
    ajaxUtils: ajaxhelper.AjaxUtils = ajaxhelper.generateOrGetAjaxUtils();
    /**
     * where dynamic. di set oleh search form
     */
    dynamicWhere: any ; 
    /**
     * where dalam include
     * key : model (saja dalam kasus no alias) <i>atau</i> model + . + alias. misal : MasterProduct.product(nama model dot nama alias)
     */
    dynamicWhereOnInclude: {[id: string ]: any } ; 
    /**
     * sort dynamic. sesuai dengan pareter
     */
    dynamicSorts: CommonCommunicationData.SortParam[] ; 
    /**
     * parameter query yang aktiv
     */
    activeQueryParameter: {
        where ?: any  ;  
        includeModels ?: CommonCommunicationData.IncludeModelParam[] ;  
        sorts ?: CommonCommunicationData.SortParam[] ;  
        page: number  ; 
        pageSize: number ; 
    } = {
        page: 0 , 
        pageSize: 15
    };
    generateDefaultState(): JqGridRowContainerDbPanelState<DATA> {
        return {
            gridDataJoinedLookups : {} , 
            listData : null! ,
            rowStateContainer : [] , 
            selectedData : null !, 
            selectedRowindex : -1 , 
            pageSelectorIndex : 0 , 
            dataCount : 0 ,
            pageCount : 0  , 
            dataRequestedFlag : false 
        };
    }
    /**
     * generate query param, dengan props + state + dynamic where
     */
    generateActiveQueryParameter ( props: JqGridRowContainerDbPanelProps<DATA>  ): any  {
        console.log('[JqGridRowContainerDbPanel] mengkalkulasi filter query');
        let generateWhere: () => any = () => {
            let w: any = {} ; 
            if ( !isNull(props.predefinedWhere)) {
                this.mergeObject(props.predefinedWhere  , w ) ; 
            }
            if ( !isNull(this.dynamicWhere)) {
                this.mergeObject(this.dynamicWhere , w ) ; 
            }
            return w ; 
        };
        // generate include model
        let generateIncludeModel: () => CommonCommunicationData.IncludeModelParam[] = () => {
            let inclModels: CommonCommunicationData.IncludeModelParam[] = [] ; 
            if ( !isNull(props.includedModels)) {
                for ( let incl of props.includedModels! ) {
                    let s: any = cloneObjectMakeDateObjectStringVariable( incl) ; 
                    inclModels.push(s) ; 
                }
            }
            if ( !isNull(this.dynamicWhereOnInclude )) {
                let keys: string [] = Object.keys(this.dynamicWhereOnInclude) ; 
                for ( let key of keys ) {
                    let mdlName: string = key ; 
                    let aSName: string = null !;
                    let wInclude: any = this.dynamicWhereOnInclude[key]; 
                    if ( key.indexOf('.') >= 0) {
                        let rSplit: string [] = key.split('.') ; 
                        mdlName = rSplit[0] ; 
                        aSName = rSplit[1] ;
                    }

                    let mtchFound: boolean = false ; 
                    for ( let incl of inclModels) {
                        if ( isNull(incl.where)) {
                            this.mergeObject(wInclude ,  incl.where);
                            mtchFound = true ; 
                            break ; 
                        }
                    }
                    if ( !mtchFound) {
                        inclModels.push({
                            as : aSName , 
                            modelName : mdlName , 
                            where : wInclude
                        });
                    }

                }
            }
            return inclModels.length === 0 ? null! : inclModels ; 
        };
        
        let generateSortParam: () => CommonCommunicationData.SortParam[] = () => {
            let rtvl: CommonCommunicationData.SortParam[] = [] ; 
            if ( !isNull(this.dynamicSorts)) {
                rtvl.push(...this.dynamicSorts);
            }
            if ( !isNull( props.sorts )) {
                for ( let r of props.sorts!) {
                    let s: any = r ; 
                    let readySortParam: CommonCommunicationData.SortParam = s ; 
                    if ( Array.isArray(r)) {
                        readySortParam = {
                            fieldName : s[0] , 
                            asc : 'asc' === s[1].toLowerCase()
                        };
                    } 
                    if ( !isSortExistOnArray(readySortParam , rtvl)) {// cross check sudah ada atau tidak dalam sort, kalau belum, baru di masukan ke dalam array sort
                        rtvl.push(readySortParam);
                    }
                }
            }
            return rtvl.length === 0 ? null! : rtvl ; 
        };
        /*
        where? : any  ;  
        includeModels? : CommonCommunicationData.IncludeModelParam[] ;  
        sorts? : CommonCommunicationData.SortParam[] ;  
         */
        return {
            where : generateWhere() , 
            includeModels : generateIncludeModel() , 
            sorts : generateSortParam(), 
            page : props.page , 
            pageSize : props.pageSize 
        };
    }
    /**
     * 
     * @param source copy data dari source ke dest, key by key
     * @param destination 
     */
    mergeObject ( source: any , destination: any ) {
        if ( isNull(source)) {
            return ; 
        }
        let deepCl: any = cloneObjectMakeDateObjectStringVariable(source); 
        let keys: string[] = Object.keys(deepCl) ; 
        for ( let k of keys ) {
            destination[k] = deepCl[k];
        }
    }
    componentDidMount () {
        this.activeQueryParameter = this.generateActiveQueryParameter( this.props);
        this.requestDataFromServer();
    }
    componentWillReceiveProps (nextProps: JqGridRowContainerDbPanelProps<DATA> ) {
        let b: any = this.generateActiveQueryParameter( nextProps); 
        let chg: boolean = false ; 
        if ( isNull(this.activeQueryParameter) ) {
            
            chg = true ; 
        } else {
            let sCurrent: string  = JSON.stringify(this.activeQueryParameter) ; 
            let nParam: string = JSON.stringify(b) ; 
            chg = (sCurrent ===  nParam) ; 
        }
        if ( chg) {
            this.activeQueryParameter = b ; 
            this.requestDataFromServer();
        }
    }
    /**
     * reload  grid dengan current filter data
     */
    reloadData () {
        this.requestDataFromServer()
            .then( d => {
                console.log('[JqGridRowContainerDbPanel] reload data sukses') ; 
            })
            .catch( exc => {
                console.error('[JqGridRowContainerDbPanel] gagal load data dari server, error : ' , exc);
            });
    }
    /**
     * ini untuk request ulang data dari server.via ajax
     */
    requestDataFromServer(    ): Promise<any> {
        return new Promise<any>(async ( accept: (n: any ) => any , reject: (exc: any ) => any ) => {
            let lookupParams: CommonCommunicationData.LookupRequestForLookupOnListDataParam[]  = this.props.lookupParams! ; 
            let pgSize: number = this.activeQueryParameter.pageSize ; 
            // let page: number = this.activeQueryParameter.page ; 
            let where: any = this.activeQueryParameter.where ; 
            let includeModels: CommonCommunicationData.IncludeModelParam[] = this.activeQueryParameter.includeModels! ; 
            let sorts: CommonCommunicationData.SortParam[] = this.activeQueryParameter.sorts! ; 
            let p: CommonCommunicationData.GridDataRequest = {
                modelName: this.props.modelName,
                page: this.props.page,
                pageSize: pgSize,
                includeModels: includeModels,
                where: where,
                lookupParams: lookupParams , 
                sorts : sorts
            };
            p['includedAssociations'] = includeModels; 
            this.state['gridRequestParam'] = p ; 
            let detachPanel: DetachPanel  = this.props.renderBlockPanel(<span>Meminta data ...</span>);

            let onDataRecieved: (data: CommonCommunicationData.GridDataRequestResponse<DATA> ) => any = (gridData: CommonCommunicationData.GridDataRequestResponse<DATA>) => {
                this.setStateHelper ( 
                    stateBaru => {
                        if ( isNull(gridData.count)) {
                            gridData.count = 0;
                        }
                        stateBaru['rawGridData'] = gridData ; 
                        stateBaru.dataRequestedFlag = true ; 
                        stateBaru.selectedData = null!;
                        stateBaru.selectedRowindex = - 1;
                        stateBaru.dataCount = gridData.count!;
                        stateBaru.pageCount = Math.ceil(gridData.count! / pgSize);
                        
                        stateBaru.gridDataJoinedLookups = {};
                        stateBaru.gridDataJoinedLookups = {} ; 
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
                        this.assignData(gridData.rows! , stateBaru ) ; 
                        return stateBaru ; 
                    } , 
                    () => {
                        if ( !isNull(this.props.onDataRecievied)) {
                            this.props.onDataRecievied!(where , gridData);
                        }
                        
                    }
                );
                detachPanel();
                accept({});
            };

            let dataErrorHandler: (code: string, message: string, exc: any) => any = (code: string, message: string, exc: any) => {
                this.setStateHelper ( 
                    st => {
                        st.selectedData = null!;
                        st.selectedRowindex = - 1;
                        st.dataCount = 0;
                        st.dataCount = 0;
                        st.listData = null!;
                        console.error('Gagal membaca data untuk model : ', this.props.modelName);
                    } , 
                    () => {
                        reject({
                            code : code , 
                            message : message , 
                            rawExc  : exc 
                        });
                });
               
            };
            if ( !isNull(this.props.customDataLoader)) {
                this.props.customDataLoader!(p , onDataRecieved, dataErrorHandler);
            } else {
                let r: any = null ; 
                try {
                    r = await this.ajaxUtils.post(
                        '/dynamics/commons/grid-data-provider.svc?sourceModule=JqDbDrivenGridPanel',
                        {param: btoa(JSON.stringify(p))} );
                } catch  ( exc ) {
                    console.error('[JqDbDrivenGridPanel]Error dalam network request grid, error : ' , exc );
                    reject(exc);
                }
                try {
                    onDataRecieved(r);
                } catch ( exc) {
                    console.error('[JqDbDrivenGridPanel]Gagal render data ke grid. error : ' , exc) ; 
                }
                accept({});
            }

        }); 

    }

}