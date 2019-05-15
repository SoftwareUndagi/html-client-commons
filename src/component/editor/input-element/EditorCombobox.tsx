
import * as React from "react" ;
import { CommonLookupValue ,  isNull , readNested , setValueHelper  } from 'base-commons-module' ; 
import { EditorInputElement  } from './CommonsInputElement';
import { i18n } from '../../../utils/index' ; 
import { EditorComboboxWrapper  } from './EditorComboboxWrapper';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../../BaseHtmlComponent';

export interface LookupComboOptionProps extends React.Props<LookupComboOption> , BaseHtmlComponentProps {
    lookupValue: CommonLookupValue ; 
    selectedValue: string ; 
}
export interface LookupComboOptionState extends BaseHtmlComponentState {}
export class LookupComboOption extends BaseHtmlComponent<LookupComboOptionProps , LookupComboOptionState> {
    render() {
        if ( this.props.selectedValue === this.props.lookupValue.detailCode ) {
            return <option key={this.props.lookupValue.detailCode + '_select'} selected={true} value={this.props.lookupValue.detailCode}>[{this.props.lookupValue.detailCode}]- {this.props.lookupValue.label}</option> ; 
        } else {
            return <option  key={this.props.lookupValue.detailCode + '_select'} value={this.props.lookupValue.detailCode}>[{this.props.lookupValue.detailCode}]- {this.props.lookupValue.label}</option> ;
        }
    }
}

/**
 * props combo box
 */
export interface EditorComboboxProps extends React.Props<EditorCombobox> {

    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;
    /**
     * nama field
     */
    fieldName: string ;
    /**
     * nama field penerima lookup label dari combo box
     */
    fieldNameForLOVLabel?: string ; 

    /**
     * nama class yang di pakai textbox
     */
    className?: string ;
    /**
     * ID untuk select component. ini kalau di perlukan manipulasi manual
     */
    selectId?: string ;

    /**
     * title untuk hint dalam textbox
     */
    title?: string ;
    /**
     * index dari tab
     */
    tabIndex: number  ;

    /**
     * state readonly atau tidak
     */
    readonlyState: boolean  ;

    /**
     * none selected. akan di default ( false)
     */
    appendNoneSelected ?: boolean ;

    /**
     * default akan di isi dengan - silakan pilih - 
     */
    noneSelectedLabel ?: string ;
    /**
     * css name untuk label readonly
     */
    readonlyCssName ?: string ;

    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: string ) => any ;
    /**
     * change handler dengan lookup data reciever
     */
    changeHandlerWithLookup ?: ( value: CommonLookupValue ) => any ; 
    /**
     * data filter. untuk memproses data yang di tampilkan 
     */
    dataFilter ?:   (lookup: CommonLookupValue) => boolean ;
    /**
     * id dari text box
     */
    id?: string ;
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: any , unregFlag?: boolean ) => any ;
    /**
     * kode lookup
     */
    lookupCode: string ;
    /**
     * lookup containers
     */
    lookupContainers:  { [id: string ]: CommonLookupValue[]};  

    /**
     * formatter valie readonly label. 
     */
    readonlyLabelFormatter ?: (lookup: CommonLookupValue) => string ;
    /**
     * formatter label combo box
     */
    comboLabelFormatter?: (lookup: CommonLookupValue) => string ;   

    /**
     * flag apakah kontrol perlu hidden atau tidak
     */
    hidden ?: boolean ; 
    /**
     * element children dari data
     */
    children ?: any ; 
    /**
     * nilai awal dari data
     */
    defaultValue ?: string ; 
    /**
     * custom handler untuk assign data to control
     */ 
    customAssignValue?: ( data: any  , comboBox: EditorComboboxWrapper ) =>  void ; 

}

/**
 * state contoiner
 */
export interface EditorComboboxState {
    value: string ;
    haveChange: boolean ;  
}

/**
 * container combo box. untuk lookup
 */
export class EditorCombobox extends BaseHtmlComponent<EditorComboboxProps , EditorComboboxState> implements EditorInputElement {
    /**
     * props untuk di check apakah membuat perubahhan ataut idak
     */
    static FIELD_COMPARED_PROPS: string[] = ['className',	'title',	'tabIndex',	'readonlyState',	'appendNoneSelected',	'noneSelectedLabel',	'readonlyCssName',	'id'] ; 

    static FIELD_COMPARED_STATE: string[] = [ 'value' , 'haveChange'] ;
    static ID_COUNTER: number = -1 ; 
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ;

    /**
     * id element combo box
     */
    elementId: string ; 
    /**
     * 
     */
    readonlyLabelFormatter:  (lookup: CommonLookupValue) => string  = EditorCombobox.FORMATTER_READONLY  ; 
    /**
     * formatter untuk combo box label
     */
    comboLabelFormatter:  (lookup: CommonLookupValue) => string  = EditorCombobox.FORMATTER_COMBO_LABEL ;
    /**
     * class untuk combo box
     */
    comboBoxClassName: string = 'form-control';

    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';
    actualComboBox: EditorComboboxWrapper ;
    /**
     * formater label readonly 
     */
    static FORMATTER_READONLY:  (lookup: CommonLookupValue) => string =  (lookup: CommonLookupValue)  => {
        if ( lookup == null || typeof lookup === 'undefined') {
            return '' ; 
        }
        return '[' + lookup.detailCode + '] - ' + lookup.label; 
    }

    /**
     * default formatter untuk readonly label
     */
    static FORMATTER_COMBO_LABEL:  (lookup: CommonLookupValue) => string =  (lookup: CommonLookupValue)  => {
        let lbl: string = lookup.label! ; 
        if ( !isNull(lookup.i18nKey)) {
            lbl = i18n( lookup.i18nKey! , lbl); 
        }
        if ( lookup == null || typeof lookup === 'undefined') {
            return '' ; 
        }
        return '[' + lookup.detailCode + '] - ' + lbl;  
    }

    constructor(  props: EditorComboboxProps ) {
        super(props); 
        this.state = { value: '', haveChange : false };
        this.elementId = props.id || null! ;
    }

    shouldComponentUpdate(nextProps: EditorComboboxProps, nextState: EditorComboboxState): boolean {
        if (this.compareForShouldComponentUpdateStateOrProp(EditorCombobox.FIELD_COMPARED_PROPS, this.props, nextProps)) {
            return true;
        }
        if (this.compareForShouldComponentUpdateStateOrProp(EditorCombobox.FIELD_COMPARED_STATE, this.state, nextState)) {
            return true;
        }
        return false ;
    }
    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    assignDataToControl  (data: any , updateState ?: boolean ) {
        if ( this.props.customAssignValue != null && typeof this.props.customAssignValue !== 'undefined') {
            this.props.customAssignValue(data , this.actualComboBox ) ; 
        } else {
            let val: string = null! ;
            if ( data != null && typeof  data !== 'undefined') {
                val = readNested( data , this.props.fieldName); 
            }
            if (!( !isNull(updateState) && !updateState) ) {
                this.setStateHelper(
                    st => st.value = val );
            } else {
                let swapState: any = this.state ; 
                swapState.value = val ;
            }
        }
    }  
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        let val: string = this.state.value ; 
        if ( isNull(this.props.appendNoneSelected) || !this.props.appendNoneSelected) {
            let rawData: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode];
            if (!isNull (rawData) && rawData.length > 0 ) {
                val = rawData[0].detailCode !;
            }
        }
        console.log('[EditorCombobox] fetchDataFromControl read value : '  , val );
        setValueHelper(data , this.props.fieldName , this.state.value); 
        if ( this.props.fieldNameForLOVLabel != null && typeof this.props.fieldNameForLOVLabel !== 'undefined') {
            // data[this.props.fieldNameForLOVLabel] = null ;
            setValueHelper(data , this.props.fieldNameForLOVLabel , null); 
            let lks: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode] || null ;
            if ( lks == null ) {
                lks = [] ; 
            }
            for ( var v of lks) {
                if ( v.detailCode === this.state.value) {
                    setValueHelper(data , this.props.fieldNameForLOVLabel , v.label);
                    break ; 
                }
            }
            
        }
    }

    componentWillMount () {
        
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorCombobox.ID_COUNTER === -1) {
                EditorCombobox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_combo_' + EditorCombobox.ID_COUNTER ;
            EditorCombobox.ID_COUNTER += 1  ;
        }
        if ( this.props.readonlyLabelFormatter != null && typeof this.props.readonlyLabelFormatter !== 'undefined' ) {
            this.readonlyLabelFormatter  =  this.props.readonlyLabelFormatter ;
        }
        if ( this.props.comboLabelFormatter != null && typeof this.props.comboLabelFormatter !== 'undefined') {
            this.comboLabelFormatter  =  this.props.comboLabelFormatter ;
        } 
        if ( this.props.registrarMethod != null && typeof this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , false ) ; 
        }
        if ( this.props.className != null && typeof this.props.className !== 'undefined' && this.props.className !== '') {
            this.comboBoxClassName = this.props.className ; 
        }
        if ( this.props.readonlyCssName) {
            this.readonlyCssName = this.props.readonlyCssName ;
        }

    }    

    /**
     * handler component di detach 
     */
    componentWillUnmount() {
        if ( this.props.registrarMethod != null && typeof this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , true) ;
        }
    }

    rendererTaskReadonlySpan () {
        let lkp: CommonLookupValue  = null! ; 
        if (  isNull( this.props.lookupCode) && this.props.lookupCode.length > 0 ) {
            let lks: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode] || null ;
            if ( lks == null ) {
                lks = [] ; 
            }
            for ( var v of lks) {
                if ( v.detailCode === this.state.value ) {
                    lkp = v ; 
                    break ; 
                } 
            }
        }
        let lbl: string = '' ;  
        if ( lkp != null ) {
            lbl = this.readonlyLabelFormatter(lkp) ; 
        } else {
            lbl = this.state.value ;
        }  
        return ( <span className={this.readonlyCssName}  dangerouslySetInnerHTML={{__html : lbl}}/>);
    }

    rendererTaskComboBox() {
        return (
        <EditorComboboxWrapper
            ref={(c: EditorComboboxWrapper) => {
                this.actualComboBox = c !; 
            }}
            hidden={this.props.hidden}
            changeHandler={(val: string ) => {
                this.setStateHelper ( 
                    st => {
                        st.value = val ; 
                    } ,
                    () => {
                    if ( !isNull(this.props.changeHandler)) {
                        this.props.changeHandler!(val);
                    }
                    if ( !isNull(this.props.changeHandlerWithLookup)) {
                        let l2:  CommonLookupValue = null! ; 
                        let theLooks: CommonLookupValue[] = this.props.lookupContainers[this.props.lookupCode] ;
                        if ( !isNull(theLooks)) {
                            for ( let sc of theLooks) {
                                if ( sc.detailCode === val ) {
                                    l2 = sc ; 
                                    break ; 
                                }
                            }
                        } 
                        this.props.changeHandlerWithLookup!(l2);
                    }
                    if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
                        try {
                            this.forceReadDataFromControlMethod(); 
                        } catch ( exc ) {
                            console.error('[EditorTextbox] gagal update state data on change') ;
                        }
                    }
                });
            }}
            appendNoneSelected={this.props.appendNoneSelected}
            noneSelectedLabel={this.props.noneSelectedLabel}
            comboLabelFormatter={isNull(this.props.comboLabelFormatter) ? EditorCombobox.FORMATTER_COMBO_LABEL : this.props.comboLabelFormatter!}
            registrarMethod={this.props.registrarMethod}
            lookupCode={this.props.lookupCode}
            lookupContainers={this.props.lookupContainers}
            selectId={this.elementId}
            tabIndex={this.props.tabIndex}
            defaultValue={this.props.defaultValue}
            className={isNull(this.props.className) ? 'form-control' : this.props.className!}
            value={this.state.value}
            dataFilter={this.props.dataFilter}
        />
                );
    }

    render () {
         
        return (this.props.readonlyState ? 
            this.rendererTaskReadonlySpan() :
            this.rendererTaskComboBox()
            ); 
    }

}
