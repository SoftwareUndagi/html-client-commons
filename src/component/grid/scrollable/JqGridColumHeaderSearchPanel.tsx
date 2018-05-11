import * as React from 'react';
import { ListOfValueManager , CommonCommunicationData , BaseComponent , BaseComponentProps , BaseComponentState } from 'core-client-commons';
import { GridHeaderSearchType , GridHeaderSearchDefinition } from '../SimpleGridMetadata';
import { QueryDateTextbox, QueryTextbox, QueryDateTextboxFromAndTo, 
    QuerySelect2, QueryDateTextboxProps, QueryTextboxProps, QueryDateTextboxFromAndToProps, 
    QuerySelect2Props , QuerySimpleComboBoxProps , QuerySimpleComboBox } from '../../search-form/SimpleQueryInputElement';
import { SimpleQueryOperator, SimpleQueryOperatorInputProps } from '../../search-form/CommonSearchForm';
import { isNull } from '../../../utils/index';
import { JqGridColumnProps } from "./GridPanel";
import {  } from '../../BaseHtmlComponent';
import { GridSearchData } from '../grid-search-data';
export interface JqGridColumHeaderSearchPanelProps<DATA> extends BaseComponentProps {
    /**
     * id dari grid
     */
    gridId: string ; 

    /**
     * lookup manager. untuk akses langsung ke lookup 
     */
    lookupManager: ListOfValueManager;
    /**
     * container lookup
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
    /**
     * command untuk navigate to page
     */
    navigate: (page: number) => any ; 
    /**
     * worker untuk assign query ke dalam include dari 
     * @param key key dari query 
     * @param queryValue value untuk query 
     * @param modelName nama model dari object
     * @param asName kalau ada alias/as dar model object 
     */
    assignQueryOnInclude: (modelName: string , key: string ,     queryValue: any , useInnerJoin: boolean, asName ?: string ) => any ; 

    /**
     * assign query untuk where. ada 2 macam where. where pada model, atau pada included association. bagian ini hanya mengurus pada where
     * @param key field untuk query 
     * @param queryValue value dari query. kalau null ini akan menghapus param query
     */
    assignQuery: (key: string, queryValue: any) => any ; 

    /**
     * definisi column
     */
    columnDefinition: JqGridColumnProps<DATA> ; 
}

export interface JqGridColumHeaderSearchPanelState <DATA> extends BaseComponentState {

    /**
     * flag ada component search atau tidak
     */
    haveSearch: boolean ; 

    /**
     * key control search. penanda kalau perlu update component, karena component di taruh dalam member variable
     */
    controlKey: string ; 

    dummyVar ?: DATA ; 
} 
/**
 * untuk render 1 column header bagian search panel
 */
export class JqGridColumHeaderSearchPanel<DATA> extends BaseComponent<JqGridColumHeaderSearchPanelProps <DATA>, JqGridColumHeaderSearchPanelState<DATA>> {
    /**
     * default untuk css textbox
     */
    static DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME: string = 'form-control' ; 

    /**
     * default css untuk combo box
     */
    static DEFAULT_SEARCH_HEADER_COMBOBOX_CSS_CLASS_NAME: string = 'form-control' ; 
    /**
     * control kosong
     */
    searchControl: any = <span/>; 
    constructor(props: JqGridColumHeaderSearchPanelProps <DATA>) {
        super(props) ; 
        this.state = {
            haveSearch : false , 
            controlKey: null! 
        } ; 
        if ( props.columnDefinition && !isNull(props.columnDefinition.searchDefinition)) {
            this.generateSearchControlCache(props.columnDefinition!.searchDefinition! , this.state) ; 
            
        }
    }
    
    /**
     * generate search control dan taruh ke dalam varibale searchControl 
     * @param searchDef 
     * @param targetState 
     */
    generateSearchControlCache ( searchDef: GridHeaderSearchDefinition , targetState: JqGridColumHeaderSearchPanelState<DATA>) {
        let key: string = 'search_panel_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 100) ; 
        targetState.haveSearch = true ; 
        targetState.controlKey = key ; 
        this.searchControl = this.rendererTaskGenerateStandardSearchEntry(this.props.columnDefinition.searchDefinition! , key );
    }

    render (): JSX.Element {
        return <th className='ui-state-default ui-th-column ui-th-ltr'>{this.searchControl}</th> ;
    }
    /**
     * worker untuk membuat search standard
     * @param searchDef definisi search. diambil dari this.headerColumnSearchParameters
     * @param key key untuk mengindari react teriak
     */
    private rendererTaskGenerateStandardSearchEntry(searchDef: GridHeaderSearchDefinition, key: string): JSX.Element  {
        // let initSrc: any = searchDef.initialSearchValue ; 
        let assignStandardField: (pr: SimpleQueryOperatorInputProps) => any = (pr: SimpleQueryOperatorInputProps) => {
            if (!isNull(searchDef.searchOnJoinDefinition)) {
                pr.includeModelName = searchDef.searchOnJoinDefinition!.modelName;
                pr.isQueryOnIncludeModel = true;
                pr.includeAs = searchDef.searchOnJoinDefinition!.includeAs;
            }
            pr.reloadGridMethod = () =>  this.props.navigate(0)  ;
        }; 
        if ( !isNull(searchDef.customSearchPanelGenerator) ) {
            return searchDef.customSearchPanelGenerator!( {
                assignQueryHandler :  this.props.assignQuery, 
                assignQueryOnIncludeModel : this.props.assignQueryOnInclude, 
                lookupManager : this.props.lookupManager , 
                lookupContainer : this.props.lookupContainers
            });
        }
        if (searchDef.searchType === GridHeaderSearchType.TEXTBOX || searchDef.searchType === GridHeaderSearchType.NUMBER_TEXTBOX || searchDef.searchType === GridHeaderSearchType.EMAIL_TEXTBOX) {
            let txtMetada: GridSearchData.TextboxSearchMetadata =  searchDef.additonalControlMetadata as GridSearchData.TextboxSearchMetadata; 

            let p: QueryTextboxProps = {
                assignQueryHandler: this.props.assignQuery,
                assignQueryOnIncludeModel: this.props.assignQueryOnInclude,
                queryField: searchDef.queryField,
                queryOperator: isNull(searchDef.queryOperator) ? SimpleQueryOperator.EQUAL : searchDef.queryOperator!, 
                textSearchMultipleValueParameterConfig : txtMetada ? txtMetada.textSearchMultipleValueParameterConfig : null!
                
            };
            if (!isNull(JqGridColumHeaderSearchPanel.DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME) && JqGridColumHeaderSearchPanel.DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME.length > 0) {
                p.className = JqGridColumHeaderSearchPanel.DEFAULT_SEARCH_HEADER_TEXTBOX_CSS_CLASS_NAME; 
            }
            assignStandardField(p);
            if (searchDef.searchType === GridHeaderSearchType.NUMBER_TEXTBOX) {
                p.useNumber = true;
            }
            p.style = { width : '100%'};
            p['key'] = key;
            let s: any = txtMetada && txtMetada.initialSearchValue  ?  txtMetada.initialSearchValue : null ! ;
            p.initialSearchValue =  s ; 
            return <QueryTextbox key={key}  {...p} /> ;
        } else if (searchDef.searchType === GridHeaderSearchType.DATE_FROM_TO) {
            
            let pDateFromTo: QueryDateTextboxFromAndToProps = {
                assignQueryHandler: this.props.assignQuery,
                assignQueryOnIncludeModel: this.props.assignQueryOnInclude,
                queryField: searchDef.queryField
            };
            let s: any = pDateFromTo;
            assignStandardField(s);

            return <QueryDateTextboxFromAndTo key={key} {...pDateFromTo} />;
        } else if (searchDef.searchType === GridHeaderSearchType.DATE_PICKER) {
            let txtDateMetada: GridSearchData.DatePickerSearchMetadata =  searchDef.additonalControlMetadata as GridSearchData.DatePickerSearchMetadata ; 
            let pDate: QueryDateTextboxProps = {
                assignQueryHandler: this.props.assignQuery,
                assignQueryOnIncludeModel: this.props.assignQueryOnInclude,
                queryField: searchDef.queryField,
                queryOperator: searchDef.queryOperator !
            };
            let s: any = pDate;
            pDate.initialSearchValue = txtDateMetada && txtDateMetada.initialSearchValue ? txtDateMetada.initialSearchValue : null! ; 
            assignStandardField(s);
            return <QueryDateTextbox key={key} {...pDate}/>;
        } else if (searchDef.searchType === GridHeaderSearchType.SELECT2) {
            let s2Metada: GridSearchData.Select2SearchMetadata =  searchDef.additonalControlMetadata as GridSearchData.Select2SearchMetadata ; 
            let pS2: QuerySelect2Props = {
                assignQueryHandler: this.props.assignQuery,
                assignQueryOnIncludeModel: this.props.assignQueryOnInclude,
                queryField: searchDef.queryField,
                dropDownContainerPanelId: searchDef.select2ContainerId , 
                lookupParameter: {
                    lookupManager: this.props.lookupManager,
                    lovId: searchDef.lookupId!
                }
            };
            pS2.initialSearchValue = s2Metada && s2Metada.initialSearchValue ? s2Metada.initialSearchValue : null!; 
            let s: any = pS2;
            assignStandardField(s);
            return <QuerySelect2 key={key} {...pS2}/>;

        } else if  ( searchDef.searchType === GridHeaderSearchType.SIMPLE_COMBOBOX ) {
            let pCmb: QuerySimpleComboBoxProps = {
                assignQueryHandler: this.props.assignQuery,
                assignQueryOnIncludeModel: this.props.assignQueryOnInclude,
                queryField: searchDef.queryField,
                lookupParameter: {
                    lookupManager: this.props.lookupManager,
                    lovId: searchDef.lookupId!
                }
            };
            if (!isNull(JqGridColumHeaderSearchPanel.DEFAULT_SEARCH_HEADER_COMBOBOX_CSS_CLASS_NAME) && JqGridColumHeaderSearchPanel.DEFAULT_SEARCH_HEADER_COMBOBOX_CSS_CLASS_NAME.length > 0) {
                pCmb.className = JqGridColumHeaderSearchPanel.DEFAULT_SEARCH_HEADER_COMBOBOX_CSS_CLASS_NAME; 
            }
            let s: any = pCmb;
            pCmb.appendNoneSelected = true ; 
            pCmb.noneSelectedLabel = QuerySimpleComboBox.NONE_SELECTED_LABEL ;
            assignStandardField(s);
            return <QuerySimpleComboBox {...pCmb}/> ;
        }
        return null!;
    }

}