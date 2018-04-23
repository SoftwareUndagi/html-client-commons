import * as React from "react";
import { BaseHtmlComponent  , BaseHtmlComponentProps , BaseHtmlComponentState } from './BaseHtmlComponent';
import { CommonCommunicationData } from 'core-client-commons/index';
import { isNull  , i18n , ObjectUtils } from '../utils/index';
declare var jQuery: any ; 

/**
 * data select2
 */
export interface Select2RawWrapperPanelData {

    /**
     * id dari data
     */
    id: string  ; 

    /**
     * di ambil default dari label
     */
    text: string ; 

    /**
     * data mentahan 
     */
    raw: CommonCommunicationData.CommonLookupValue ;

    /**
     * ini kalau custom formatter produce jsx bukan string value
     */
    jsxPanel ?: JSX.Element ;  
}

export interface Select2RawWrapperPanelProps extends BaseHtmlComponentProps {

    /**
     * style untuk component
     */
    style ?: React.CSSProperties ; 

    /**
     * data lookups
     */
    lookups ?: CommonCommunicationData.CommonLookupValue[] ; 

    /**
     * value dari current data
     */
    value ?: string ; 
    /**
     * handler kalau value berubah
     */
    onValueChange: ( val: string ) => any ;

    /**
     * handler kalau value berubah. dengan lookup
     */
    onValueChangeWithLookup: ( val: CommonCommunicationData.CommonLookupValue ) => any ; 
    /**
     * formatter label combo box
     */
    labelFormatter: (lookup: CommonCommunicationData.CommonLookupValue) => string ; 

    /**
     * isian kalau tidak ada yang di pilih, misal : silakan pilih 
     */
    placeholder: string ; 
} 
export interface Select2RawWrapperPanelState extends BaseHtmlComponentState {

    /**
     * kalau ada error 
     */
    nativeRenderErrorMessage: string|null ; 

    /**
     * data untuk di render
     */
    select2DataToRender: Select2RawWrapperPanelData[]|null ; 

    /**
     * data select 2 di index
     */
    indexedSelect2DataToRender: {[id: string]: Select2RawWrapperPanelData } ; 

    /**
     * flag ada panel custom atau tidak dalam salah satu data. ini kalau labelFormatter return JSX.Element
     */
    haveCustomPanel: boolean ; 
} 

export class Select2RawWrapperPanel extends BaseHtmlComponent<Select2RawWrapperPanelProps , Select2RawWrapperPanelState> {
    elementId: string = 'automatic_element_' + new Date().getTime() + '_' + Math.ceil( Math.random() * 100); 

    /**
     * prefix dari id panel di drive jsx
     */
    jsxDrivenCustomPanelIdPrefix: string = 'select2_jsx_driven_panel_' +   new Date().getTime() + '_' + Math.ceil( Math.random() * 100); 
    /**
     * flag control initialized atau bulum
     */
    initialized: boolean = false ; 
    /**
     * focus ke control
     */
    focusToControl: () => any = () => {
        let el: any = document.getElementById(this.elementId) ; 
        if ( isNull(el)) {
            return ; 
        }
        let sel: HTMLSelectElement = el ; 
        if ( !isNull(sel.focus)  ) {
            sel.focus()  ; 
        }
    }
    constructor(props: Select2RawWrapperPanelProps) {
        super(props) ; 
        this.state = {
            nativeRenderErrorMessage  : null , 
            select2DataToRender : [] , 
            indexedSelect2DataToRender : {} , 
            haveCustomPanel : false 
        };
        this.populateListDataWorker(props , this.state); 
    }

    populateListDataWorker ( targetProps: Select2RawWrapperPanelProps , targetState: Select2RawWrapperPanelState) {
        targetState.select2DataToRender = []; 
        if ( !isNull(targetProps.lookups) && targetProps!.lookups!.length > 0 ) {
            let haveJsxPanel: boolean = false ; 
            for ( let l of targetProps.lookups!) {
                let lbl: any = targetProps.labelFormatter(l);
                let lblActual: string = l.label! ; 
                let jsxPnl: any = null; 
                if ( lbl != null ) {
                    if ( typeof lbl !== 'string') {
                        haveJsxPanel = true ; 
                        jsxPnl = lbl ; 
                    } else {
                        lblActual = lbl ;
                    }
                }
                let dt: Select2RawWrapperPanelData = {
                    id : l.detailCode! , 
                    text : lblActual , 
                    raw : l , 
                    jsxPanel : jsxPnl 
                };
                targetState.select2DataToRender.push(dt); 
                targetState.indexedSelect2DataToRender[l.detailCode! ] = dt ; 
            }
            targetState.haveCustomPanel = haveJsxPanel ; 
        }
    }

    componentDidMount () {
        this.runInitSelect2() ; 
    }

    componentDidUpdate(prevProps: Select2RawWrapperPanelProps , prevState: Select2RawWrapperPanelState) {
        if ( this.initialized) {
            let detailHaveChange: boolean = ObjectUtils.compareFieldsArray(prevProps.lookups! , this.props.lookups!, []) ; 
            if ( detailHaveChange) {
                this.rebuildData() ;
            } else {
                let jqRef: any = jQuery("#" + this.elementId) ; 
                if ( jqRef.val() !== this.props.value) {
                    jqRef.val(this.props.value)
                        .trigger('change');
                }
                
            }
            
        }
    }

    componentWillUpdate(nextProps: Select2RawWrapperPanelProps , nextState: Select2RawWrapperPanelState) {
        let detailHaveChange: boolean = ObjectUtils.compareFieldsArray(nextProps.lookups! , this.props.lookups! , []) ; 
        if ( detailHaveChange) {
            this.populateListDataWorker(nextProps , nextState); 
        }
    }

    render () {
        if ( !isNull(this.state.nativeRenderErrorMessage)) {
            return (<span style={{color : 'red'}}>{this.state.nativeRenderErrorMessage}</span>);
        }
        let styl: React.CSSProperties = this.props.style! ; 
        if ( isNull(styl)) {
            styl = { width : '100%'}; 
        }
        return (
            <span>
                <select id={this.elementId}  style={styl}>{}</select>{this.rendererCustomJsxGeneratedDetailPanel()}
            </span>
        );
    }

    private rebuildData ( ) {
        let placeHolder: string = isNull(this.props.placeholder) || this.props.placeholder === '' ? i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - ') : this.props.placeholder;
        try {
            let jqRef: any = jQuery("#" + this.elementId) ; 
            jqRef.empty() ; 
            // FIXME : custom formatter perlu di masukan ke dalam param : templateResult : (data , param2) => html element 
            // id dari data --> data 
            
            jqRef.select2({ 
                tags: false,
                placeholder: placeHolder,
                allowClear: true , 
                data : this.state.select2DataToRender ,
                multiple : false 
             });
            if ( !isNull(this.props.value) && this.props.value !== ""  ) {
                jqRef.val(this.props.value)
                    .trigger('change'); 
            } else {
                jqRef.val("")
                .trigger('change'); 
            }
            
        } catch ( exc) {
            this.setStateHelper( st => {
                st.nativeRenderErrorMessage = exc.message ; 
            }); 
        }   
    }

    private runInitSelect2 () {
        let placeHolder: string = isNull(this.props.placeholder) || this.props.placeholder === '' ? i18n('query.select2.simple.noneSelectedLabel' , '- silakan pilih - ') : this.props.placeholder;
        let sDat: any = null ; 
        if ( this.initialized ) {
            return ; 
        }
        try {
            let cmpn = jQuery("#" + this.elementId).select2({
                tags: false,
                placeholder: placeHolder,
                allowClear: true , 
                data : this.state.select2DataToRender ,
                multiple : false 
              });
            this.initialized = true ; 
            cmpn.on("change",  ( param ) => {
                let elId: string = this.elementId ; 
                let val: any = jQuery("#" + elId).val() ; 
                this.props.onValueChange(val); 
                let lkVal: CommonCommunicationData.CommonLookupValue = sDat ; 
                if ( !isNull (this.props.lookups)) {
                    for ( let l of this.props.lookups!) {
                        if ( l.detailCode === val ) {
                            lkVal = l ; 
                            break ; 
                        }
                        if ( typeof l.detailCode === 'number') {
                            if ( val / 1 === l.detailCode) {
                                lkVal = l ; 
                                break ; 
                            }
                        }
                    }
                }
                this.props.onValueChangeWithLookup( lkVal);
                
            });
            if ( !isNull(this.props.value)) {
                cmpn.val(this.props.value); 
            }
        } catch ( exc) {
            this.setStateHelper( st => {
                st.nativeRenderErrorMessage = exc.message ; 
            }); 
        }
        
    }

    private rendererCustomJsxGeneratedDetailPanel (): JSX.Element {
        let rows: any [] = []  ; 
        if ( !isNull(this.state.select2DataToRender)) {
            for ( let d of this.state.select2DataToRender!) {
                if ( isNull(d.jsxPanel) ) {
                    continue ; 
                }
                let id: string = this.jsxDrivenCustomPanelIdPrefix + d.raw.detailCode ;
                rows.push(<span id={id} key={id}> {d.jsxPanel}</span>); 
            }
        }
        return <span style={{display : 'none'}}>{rows}</span> ; 
    }
}