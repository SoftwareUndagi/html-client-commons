import * as React from "react" ;
import { isNull, readNested, setValueHelper } from 'core-client-commons';
import { EditorInputElement  } from './CommonsInputElement';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../../BaseHtmlComponent';

/**
 * enum untuk data checkbox
 */
export interface SimpleCheckboxEnumeration {

    /**
     * nilai untuk checked item
     */
    valueForChecked: string  ;  
    /**
     * nilai untuk unchecked checkbox
     */
    valueForUnchecked: string ;
}

export interface EditorCheckboxProps extends BaseHtmlComponentProps {

    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ; 
    /** 
     * enumerasi untuk value. default : checked : Y , unchecked : N
     */
    valueEnumeration ?: SimpleCheckboxEnumeration ; 
    /**
     * nama field
     */
    fieldName: string ;

    /**
     * nama class yang di pakai textbox
     */
    className ?: string ;

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
     * textbox di disabled atau tidak
     */
    disabled ?: boolean ; 

    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: EditorCheckbox , unregFlag ?: boolean ) => any ; 

    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: string ) => any ;

}
export interface EditorCheckboxState extends BaseHtmlComponentState {
    checked: boolean ; 

}
/**
 * control editor checkbox
 */
export class EditorCheckbox extends BaseHtmlComponent <EditorCheckboxProps , EditorCheckboxState> implements EditorInputElement {

    /**
     * enumerasi value standard
     */
    static DEFAULT_VALUE_ENUMERATION:   SimpleCheckboxEnumeration = {
        valueForChecked : 'Y' , 
        valueForUnchecked : 'N'
    }; 
    /**
     * css standard untuk control
     */
    static DEFAULT_CSS: string = null! ; 
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState ?: boolean) => any ; 
    valueEnumeration: SimpleCheckboxEnumeration = EditorCheckbox.DEFAULT_VALUE_ENUMERATION ;

    constructor(props: EditorCheckboxProps) {
        super(props) ; 
        this.state = {
            checked : false 
        } ; 
        if ( !isNull(props.valueEnumeration)) {
            this.valueEnumeration = props.valueEnumeration! ; 
        }
        props.registrarMethod(this); 
    }
    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean ) {
        let val: string = null! ;
        if ( data != null && typeof  data !== 'undefined') {
            val = readNested (  data , this.props.fieldName); 
        }
        if ( val == null || typeof val === 'undefined' ) {
            val = ''; 
        }
        if ( isNull(updateState) || updateState) {
            this.setStateHelper ( 
                st => st.checked = (val === this.valueEnumeration.valueForChecked)); 
        } else {
            let swapState: any = this.state ; 
            swapState.checked = (val === this.valueEnumeration.valueForChecked); 
        }
    }  
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        setValueHelper( data, this.props.fieldName ,   this.state.checked ? this.valueEnumeration.valueForChecked :  this.valueEnumeration.valueForUnchecked) ;
    }

    componentWillUnmount() {
        this.props.registrarMethod(this, true);
    }

    onClick: () => void = () =>  {
        if ( !isNull(this.props.disabled) && this.props.disabled) {
            console.warn('checkbox disabled flag = true ') ;
            return ; 
        }
        this.setStateHelper ( 
            st => {
            st.checked = !this.state.checked ;  
        } , () => {
            console.log('checkbox di ganti menjadi : ' , this.state.checked ); 
            if ( !isNull(this.props.changeHandler)) {
                this.props.changeHandler!( this.state.checked ? this.valueEnumeration.valueForChecked : this.valueEnumeration.valueForUnchecked); 
            }
            if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
                try {
                    this.forceReadDataFromControlMethod(); 
                } catch ( exc ) {
                    console.error('[EditorTextbox] gagal update state data on change') ; 
                }
            }
        });
    }
    render (): JSX.Element  {
        let disabled: boolean = false ; 
        if ( !isNull(this.props.disabled)) {
            disabled = this.props.disabled !; 
        }
        let readOnly: boolean = false ; 
        if ( !isNull(this.props.readonlyState) && this.props.readonlyState) {
            readOnly  = true ; 
        }
        // let css: string = !isNull(this.props.className) ? this.props.className! :  EditorCheckbox.DEFAULT_CSS ; 
        return (
        <input 
            type='checkbox'
            readOnly={readOnly}
            className={this.props.className}
            onClick={this.onClick}   
            disabled={disabled}
        />);

    }

} 