import * as React from 'react';
import { JqGridColumnProps } from './GridPanelComponent';
import { JqGridColumHeaderPanelProps, JqGridColumHeaderPanel } from './JqGridColumHeaderPanel';
import { CommonCommunicationData  , isNull , ListOfValueManager , CloseEditorCommandAsync  } from 'core-client-commons/index';
import { SimpleQueryOperator, SimpleQueryOperatorInputProps } from '../../search-form/CommonSearchForm';
import { QueryDateTextbox, QueryTextbox,  QuerySelect2, QueryDateTextboxProps, QueryTextboxProps,  QuerySelect2Props , QuerySimpleComboBoxProps , QuerySimpleComboBox } from '../../search-form/SimpleQueryInputElement';
import { GridHeaderSearchType, GridHeaderSearchDefinition } from '../SimpleGridMetadata';
import { BaseHtmlComponent } from '../../BaseHtmlComponent';
import { GridSearchData } from '../grid-search-data'; 
import { BaseGrid } from '../BaseGrid'; 
import { GridDateFromToSearchEntryPanel } from '../GridDateFromToSearchEntryPanel'; 
import { GridMultipleSelectSearchEntryPanel } from '../GridMultipleSelectSearchEntryPanel' ; 

export interface JqGridHeaderPanelProps<DATA> {
    /**
     * hanlder kalau sort berubah
     * @param columnDef definisi column. yang akan di baca untuk membaca metadata
     * @param asc flag asc sort atau sebailknya
     */
    onChangeSort: (columnDef: JqGridColumnProps<DATA>, asc: boolean) => any ; 
    /**
     * resizer column header
     */
    resizeColumnWidth:  ( index: number ,    panelNewWidth: number ) => any ; 
    /**
     * tinggi actual dari grid
     */
    gridActualHeight: number ; 
    /**
     * id dari grid
     */
    gridId: string ; 
    /**
     * column defs
     */
    columnDefinitions: JqGridColumnProps<DATA>[];
    /**
     * assign query untuk where. ada 2 macam where. where pada model, atau pada included association. bagian ini hanya mengurus pada where
     * @param key field untuk query 
     * @param queryValue value dari query. kalau null ini akan menghapus param query
     */
    assignQueryHandler: (key: string, queryValue: any) => any ; 
    /**
     * command untuk remove query
     */
    removeQueryHandler: (key: string ) => any ;
    /**
     * untuk remove query pada include
     */
    removeQueryOnIncludeModel: (modelName: string , key: string ,      asName ?: string ) => any ; 
    /**
     * worker untuk assign query ke dalam include dari 
     * @param key key dari query 
     * @param queryValue value untuk query 
     * @param modelName nama model dari object
     * @param asName kalau ada alias/as dar model object 
     */
    assignQueryOnIncludeModel: (modelName: string , key: string ,     queryValue: any , useInnerJoin: boolean, asName ?: string ) => any ;

    /**
     * lookup manager. untuk akses langsung ke lookup 
     */
    lookupManager: ListOfValueManager;
    /**
     * lebar dari grid
     */
    gridWidth: number ; 
    /**
     * container lookup actual yang di pakai oleh grid
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
    /**
     * navigasi halaman ke halaman di minta. 
     * @param page page yang di minta untuk di load
     */
    navigate: (page: number) => any ; 
    /**
     * flag header collapsed atau tidak
     */
    headerCollapsed: boolean;
    /**
     * lebar berdasarakn column def
     */
    widthComputedColumn: number ; 
    /**
     * css utnuk search textbox. ini di palai hanya kalau db
     */
    cssForSearchTextBox: string; 

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
     * command untuk menaruh panel dalam grid. ini untuk search yang perlu areal lebar. ndak cukup dengan drop down
     */
    putPanelInsideGridCommand: ( panels: JSX.Element[] ) => CloseEditorCommandAsync  ; 
} 

export interface JqGridHeaderPanelState {}
/**
 * header column untuk jqgrid
 */
export class JqGridHeaderPanel<DATA> extends BaseHtmlComponent<JqGridHeaderPanelProps<DATA> , JqGridHeaderPanelState> {
    constructor(props: JqGridHeaderPanelProps<DATA>) {
        super(props) ; 
        this.state = {}; 
    }
    shouldComponentUpdate(nextProps: JqGridHeaderPanelProps<DATA>, nextState: JqGridHeaderPanelState) {
        for ( let k of ['gridActualHeight' , 'columnDefinitions', 'gridWidth' , 'headerCollapsed', 'widthComputedColumn']) {
            if ( this.props[k] !== nextProps[k]) {
                return true ; 
            }
        }
        return false ; 
    }
    /**
     * worker untuk membuat column headers rows 1.
     */
    render(): JSX.Element {
        let gridWidth: number = this.props.gridWidth ;
        let tds: any[] = [];
        let idx: number = 1;
        let searchCount: number = 0 ; 
        for (let l of this.props.columnDefinitions) {
            let k: string = 'auto_head_column_' + this.props.gridId + '_' + idx;
            tds.push(this.rendererTaskGridColumnHeader(l, idx - 1 , k));
            if  ( !isNull(l.searchDefinition)) {
                searchCount ++ ; 
            }
            idx++;
        }
        let searchRows: any[] = []; 
        if ( searchCount > 0 ) {
            idx = 0 ; 
            for (let l of this.props.columnDefinitions) {
                if ( isNull(l.searchDefinition)) {
                    searchRows.push(<th className='ui-state-default ui-th-column ui-th-ltr' key={'search_col_' + idx}>{}</th>);
                } else {
                    let lblCol: string = l.columnTitle ; 
                    let pSearch: any = this.rendererTaskGenerateStandardSearchEntry( l.searchDefinition!, lblCol , 'search_' + idx ) ; 
                    if ( isNull(pSearch)) {
                        searchRows.push(<th className='ui-state-default ui-th-column ui-th-ltr' key={'search_col_' + idx}>{}</th>);
                    } else {
                        searchRows.push(
                        <th className='ui-state-default ui-th-column ui-th-ltr' key={'search_col_' + idx}>{pSearch}</th>);
                    }
                    
                }
                idx++ ;
            }
        }
        let style: any = { width: gridWidth + 'px' };
        if (this.props.headerCollapsed) {
            style.display = 'none';
        }
        return (
            <div key={this.props.gridId + '_header_scroller'} id={this.props.gridId + '_header_scroller'} className="ui-state-default ui-jqgrid-hdiv" style={style}>
                <div className="ui-jqgrid-hbox" key={this.props.gridId + 'grid_header_container'} id={this.props.gridId + 'grid_header_container'}>
                    <table
                        key={this.props.gridId + 'grid_header_table'}
                        className="ui-jqgrid-htable"
                        style={{ width: this.props.widthComputedColumn + 'px' }} 
                        role="grid"
                        aria-labelledby={'gbox_' + this.props.gridId}
                        cellSpacing={0} 
                        cellPadding={0} 
                    >
                        <thead key={this.props.gridId + 'grid_header_thead'}>
                            < tr key={'automated_row_' + this.props.rowNumberParam} className="ui-jqgrid-labels" role="rowheader" >
                                {tds}
                            </tr>
                            {(() => {
                                if ( searchCount > 0) {
                                    return < tr key={'automated_row_' + this.props.rowNumberParam + '_search_field'} className="ui-jqgrid-labels" role="rowheader" >
                                        {searchRows}
                                    </tr>;
                                }
                                return null ; 
                            })()}
                        </thead>
                    </table>
                </div>
            </div>);
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
                this.props.onChangeSort(columnDef, asc);
            }, 
            gridHeight : this.props.gridActualHeight, 
            boundingGridPanelId : this.props.gridId + '_scroller_panel' , 
            resizeColumnCommand : this.props.resizeColumnWidth ,
            columnIndex : columnIndex
        };
        console.log('[BaseGridPanel] render header column dengan prop : ' , pCol);
        return <JqGridColumHeaderPanel key={key} {...pCol}>{}</JqGridColumHeaderPanel>;
    }

    private renderSelect2QueryPanel (searchDef: GridHeaderSearchDefinition, key: string , assignStandardField: (pr: SimpleQueryOperatorInputProps) => any ): JSX.Element  {
        let pS2: QuerySelect2Props = {
            assignQueryHandler: this.props.assignQueryHandler!,
            assignQueryOnIncludeModel: this.props.assignQueryOnIncludeModel!,
            queryField: searchDef.queryField,
            dropDownContainerPanelId : searchDef.select2ContainerId , 
            lookupParameter: {
                lookupManager: this.props.lookupManager!,
                lovId: searchDef.lookupId!
            }
        };
        
        let swap: any = searchDef.additonalControlMetadata;  
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
            assignQueryHandler: this.props.assignQueryHandler,
            assignQueryOnIncludeModel: this.props.assignQueryOnIncludeModel!,
            queryField: searchDef.queryField,
            queryOperator: searchDef.queryOperator! , 
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
            assignQueryHandler: this.props.assignQueryHandler,
            assignQueryOnIncludeModel: this.props.assignQueryOnIncludeModel,
            queryField: searchDef.queryField,
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
            // if ( !isNull(BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX) && BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX.length > 0 ) {
        } else {
            if ( !isNull(BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX) && BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX.length > 0 ) {
                p.className = BaseGrid.DEFAULT_CSS_SEARCH_TXTBOX ;
            }
        }
        
        if (!isNull(this.props.cssForSearchTextBox) && this.props.cssForSearchTextBox.length > 0) {
            p.className = this.props.cssForSearchTextBox; 
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
        return <QueryTextbox key={key}  {...p} /> ;
    }
    /**
     * worker untuk membuat search standard
     * @param searchDef definisi search. diambil dari this.headerColumnSearchParameters
     * @param key key untuk mengindari react teriak
     * @param columnTitle label dari column di bagian header
     */
    private rendererTaskGenerateStandardSearchEntry(searchDef: GridHeaderSearchDefinition, columnTitle: string , key: string): JSX.Element  {
         
        let assignStandardField: (pr: SimpleQueryOperatorInputProps) => any = (pr: SimpleQueryOperatorInputProps) => {
            if (!isNull(searchDef.searchOnJoinDefinition)) {
                pr.includeModelName = searchDef.searchOnJoinDefinition!.modelName;
                pr.isQueryOnIncludeModel = true;
                pr.includeAs = searchDef.searchOnJoinDefinition!.includeAs;
            }
            pr.reloadGridMethod = () =>  this.props.navigate(0);
        }; 
        if ( !isNull(searchDef.customSearchPanelGenerator) ) {
            return searchDef.customSearchPanelGenerator!( {
                assignQueryHandler :  this.props.assignQueryHandler, 
                assignQueryOnIncludeModel : this.props.assignQueryOnIncludeModel, 
                lookupManager : this.props.lookupManager , 
                lookupContainer : this.props.lookupContainers
            });
        }
        if (searchDef.searchType === GridHeaderSearchType.TEXTBOX || searchDef.searchType === GridHeaderSearchType.NUMBER_TEXTBOX || searchDef.searchType === GridHeaderSearchType.EMAIL_TEXTBOX) {
            return this.renderTextboxSearchQueryTextbox(searchDef , key , assignStandardField) ; 
        } else if  ( searchDef.searchType ===  GridHeaderSearchType.MULTIPLE_SELECTION ) {
            return (
            <GridMultipleSelectSearchEntryPanel 
                assignQueryHandler={this.props.assignQueryHandler}
                assignQueryOnIncludeModel={this.props.assignQueryOnIncludeModel!}
                navigate={this.props.navigate}
                putPanelInsideGridCommand={this.props.putPanelInsideGridCommand}
                searchDef={searchDef}
                removeQueryHandler={this.props.removeQueryHandler}
                removeQueryOnIncludeModel={this.props.removeQueryOnIncludeModel}
                key={key}
                columnTitle={columnTitle}
                lookupContainers={this.props.lookupContainers}
                lookupManager={this.props.lookupManager}
                lovId={searchDef.lookupId!}
            />) ;
        } else if (searchDef.searchType === GridHeaderSearchType.DATE_FROM_TO) {
            return (
            <GridDateFromToSearchEntryPanel 
                assignQueryHandler={this.props.assignQueryHandler}
                assignQueryOnIncludeModel={this.props.assignQueryOnIncludeModel}
                navigate={this.props.navigate}
                putPanelInsideGridCommand={this.props.putPanelInsideGridCommand}
                searchDef={searchDef}
                removeQueryHandler={this.props.removeQueryHandler}
                removeQueryOnIncludeModel={this.props.removeQueryOnIncludeModel}
                key={key}
                columnTitle={columnTitle}
            />);
            
        } else if (searchDef.searchType === GridHeaderSearchType.DATE_PICKER) {
            return this.renderDatePickerQueryDatePicker (searchDef , key , assignStandardField) ; 
        } else if (searchDef.searchType === GridHeaderSearchType.SELECT2) {
            return this.renderSelect2QueryPanel  (searchDef , key , assignStandardField) ; 
        } else if  ( searchDef.searchType === GridHeaderSearchType.SIMPLE_COMBOBOX ) {
            let pCmb: QuerySimpleComboBoxProps = {
                assignQueryHandler: this.props.assignQueryHandler,
                assignQueryOnIncludeModel: this.props.assignQueryOnIncludeModel,
                queryField: searchDef.queryField,
                lookupParameter: {
                    lookupManager: this.props.lookupManager,
                    lovId: searchDef.lookupId!
                }
            };
            let s: any = pCmb;
            pCmb.appendNoneSelected = true ; 
            pCmb.noneSelectedLabel = QuerySimpleComboBox.NONE_SELECTED_LABEL ;
            assignStandardField(s);
            return <QuerySimpleComboBox {...pCmb}/> ;
        }
        return null!;
    }

}