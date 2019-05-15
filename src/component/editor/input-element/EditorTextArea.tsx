
import * as React from "react";

import { CommonLookupValue , readNested , setValueHelper , isNull } from 'base-commons-module';
import { EditorInputElement } from 'core-client-commons';

import { BaseHtmlComponent, BaseHtmlComponentProps, BaseHtmlComponentState } from "../../BaseHtmlComponent";
/**
 * state editor text area
 */
export interface EditorTextAreaState extends BaseHtmlComponentState {
    value: string ; 
}
/**
 * property untuk text area
 */
export interface EditorTextAreaProps extends BaseHtmlComponentProps {
    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;
    /**
     * kalau di update on change, aplikasi cenderung lamban. default akan di anggap false. data baru di update on lost focus
     * kalau di set false, maka tiap change akan update editor state
     */
    doNotUpdateEditorStateOnChange ?: boolean ; 
    /**
     * nama field
     */
    fieldName: string ;

    /**
     * nama class yang di pakai textbox
     */
    className?: string ;

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
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: EditorTextArea , unregFlag?: boolean ) => any ;

    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: string ) => any ;
    /**
     * focus event handler
     */
    onBlur?: React.FocusEventHandler<any>   ; 
    /**
     * jumlah cols dalam text area
     */
    cols ?: number ; 
    /**
     * jumlah rows
     */
    rows?: number ; 
    /**
     * id dari text area
     */
    id?: string ;
    /**
     * element children dari data
     */
    children ?: any ; 
    /**
     * flag required atau tidak
     */
    required  ?: boolean ; 
    /**
     * message generator kalau panjang text area melebih kapasitas
     */
    lengthExceedMessageGenerator ?: (textLength: number , maxLength: number , textArea: EditorTextArea  ) => string ; 
    /**
     * berapa panjang maksimal dari isi textbox
     */
    maxLength ?: number ; 
    /**
     * handler kalau lost focust dan value change
     */
    onLostFocusAndValueChange ?:  (val: string ) => string ; 
}
/**
 * wrapper text area
 */
export class EditorTextArea extends BaseHtmlComponent < EditorTextAreaProps, EditorTextAreaState> implements EditorInputElement {

    className: string = 'form-control'  ;
    elementId: string ; 
    readonlyLabelFormatter: (val: CommonLookupValue) => string ;
    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ; 
    constructor(props: EditorTextAreaProps) {
        super(props); 
        this.state = {value: ''};
        this.elementId = props.id || null! ; 
        if  ( this.elementId == null) {
            this.elementId = 'core_component_textarea_' + new Date().getTime()  ; 
        }
        if ( props.registrarMethod ) {
            this.props.registrarMethod(this) ;
        }
    }

    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean ) {
        let d: string =  '' ; 
        if ( data != null && typeof data !== 'undefined' ) {
            d = readNested (  data , this.props.fieldName) || null;
        } 
        if ( d == null || typeof d === 'undefined') {
            d = ''; 
        }
        if ( isNull(updateState) || !updateState) {
            let swapState: any = this.state ; 
            swapState.value  = d ; 
        } else {
            this.setStateHelper ( st => st.value = d ); 
        }
    }
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        setValueHelper( data , this.props.fieldName , this.state.value) ; 
    }  

    /**
     * handler component di detach 
     */
    componentWillUnmount() {
        if ( this.props.registrarMethod != null && typeof this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , true) ;
        }
    }
    rendererNormalTextarea() {
        let id: string = this.elementId;
        return (
            <textarea 
                
                value={this.state.value}
                onChange={this.onChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                required={isNull( this.props.required) ? false : this.props.required}
                id={id}
                tabIndex={this.props.tabIndex}
                title={this.props.title}
                cols={this.props.cols}
                rows={this.props.rows}
                className={!isNull(this.props.className) ?  this.props.className :  this.className}
            />
        );
    }
    render () {
        if (! this.props.readonlyState) {
            return this.rendererNormalTextarea() ; 
        }
        return (<span className={this.readonlyCssName}>{this.state.value}</span>);

    }
    private onChange: (evt: any ) => void = (evt: any ) => {
        let val: any = isNull(evt) || isNull(evt.target) ? null : evt.target.value ; 
        if ( this.state.value === val ) {
            return ; 
        }
        this.setStateHelper ( 
            st => st.value = val , 
            () => {
                if ( this.props.changeHandler != null) {
                    this.props.changeHandler(val);
                }
                if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
                    let upd: boolean = true ; 
                    if ( this.props.doNotUpdateEditorStateOnChange && !this.props.doNotUpdateEditorStateOnChange) {
                        upd = false ; 
                    }
                    try {
                        this.forceReadDataFromControlMethod(upd); 
                    } catch ( exc ) {
                            console.error('[EditorTextbox] gagal update state data on change');
                    }
                }
        });
    }
    private onBlur:  (evt: any ) => void = (evt: any ) => {
        if ( this.props.onBlur) {
            this.props.onBlur(evt);
        }
        if ( this.props.onLostFocusAndValueChange && this['preEditValue'] !== evt.target.value ) { 
            this.props.onLostFocusAndValueChange(evt.target.value);
        }
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            if ( this['preEditValue'] !== evt.target.value) {
                if (!( ! isNull( this.props.doNotUpdateEditorStateOnChange) && !this.props.doNotUpdateEditorStateOnChange)) {
                    this.forceReadDataFromControlMethod(false); 
                }
            }
        }
    }
    private onFocus: (evt: any ) => void = (evt: any ) => {
        this['preEditValue'] = evt.target.value ; 
    }
}