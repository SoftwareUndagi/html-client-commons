import * as React from "react" ;
import { EditorInputElement } from './CommonsInputElement';
import { isNull, readNested, setValueHelper  } from '../../../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';
/**
 * state contoiner
 */
export interface EditorTextboxState extends BaseHtmlComponentState {
    value: string ; 
    /**
     * marker value sudah berubah atau tidak
     */
    valueHaveChange: boolean ; 
}
/**
 * props untuk simple textbox
 */
export interface EditorTextboxProps extends React.Props<any> , BaseHtmlComponentProps {
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
     * panjang karakter max
     */
    maxLength?: number ;

    /**
     * textbox di disabled atau tidak
     */
    disabled ?: boolean ; 
    /**
     * flag required atau tidak
     */
    required?: boolean ; 

    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: any , unregFlag?: boolean ) => any ; 

    /**
     * default : text. pergunakan ini kalau mau memakai misal hidden
     */
    inputType?: string ;

    /**
     * default value untuk control
     */
    defaultValue ?: string ; 
    /**
     * css name untuk label readonly
     */
    readonlyCssName ?: string ;

    /**
     * css untuk wrapper css 
     */
    cssForSpanTextboxWrapper ?: string ; 
    /**
     * handler pada saat control di blur(lost focus)
     * @param currentValue value saat ini
     * @param hasUserChangeValue ini kalau ada perubahan data dari user input. ini untuk menandai perlu pengecekan atau tidak
     * @param textbox target element yang di event handler
     */
    onBlur ?: ( currentValue: string , hasUserChangeValue: boolean ,    textbox: EditorTextbox ) => any  ;

    /**
     * handler pada saat element di focus
     */
    onFocus ?: (textbox: EditorTextbox) => any ;
    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: string ) => any ;

    /**
     * id dari text box
     */
    id?: string ;

    /**
     * element children dari data
     */
    children ?: any ; 

    /**
     * nama variable. kalau di register
     */
    variableName?: string ; 
    /**
     * register lookup ke parent. di register on mount
     */
    registerVariableMethod ?: (variableName: string , control: any) => any ;

    /**
     * fetched id dari attribute dari data
     * @return id dari product yang di pilih. kalau ada reference ke product, sekalian di kirimkan , kalau tidak yang di isikan cuma id dari product
     */
    customFetchValueFromData?: (data: any) => string;
    /**
     * assign data dari control ke data
     * @param targetData  kemana data akan di salin
     * @param value value di salin ke control
     */
    customAssignValueToData?: (targetData: any, value: string ) => any;

}
/**
 * wrapper textbox
 */
export class EditorTextbox extends BaseHtmlComponent<EditorTextboxProps , EditorTextboxState> implements EditorInputElement {

    static ID_COUNTER: number   = -1;
    
    /**
     * class untuk textbox
     */
    textboxClassName: string  = 'form-control' ;
    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';

    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ; 

    private elementId: string ;
    
    constructor(props: EditorTextboxProps) {
        super(props) ;
        this.state = {value: '' , valueHaveChange: false } ;
        if ( isNull(this.elementId)) {
            this.elementId = 'txt_component_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 100 )  ; 
        }
    }

    shouldComponentUpdate(nextProps: EditorTextboxProps, nextState: EditorTextboxState) {
        for ( let k1 of ['value', 'valueHaveChange']) {
            if ( this.state[k1] !== nextState[k1]) {
                return true ; 
            }
        }
        for ( let k2 of ['className', 'title' , 'readonlyState', 'disabled', 'required' , 'readonlyCssName', 'cssForSpanTextboxWrapper']) {
            if ( this.props[k2] !== nextProps[k2]) {
                return true ; 
            }
        }
        return false ; 
    }
    focus () {
        try {
            document.getElementById(this.elementId)!.focus(); 
        } catch ( exc ) {
            console.error('Gagal focus ke element : EditorTextbox.error : ' , exc) ; 
        }
         
    }
    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    /**
     * set label untuk control
     */
    setValue ( label: string ) {
        this.setStateHelper ( sln => sln.value = label  ); 
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean  ) {
        this.setStateHelper ( st => {
            let val: string = null! ;
            if ( data != null && typeof  data !== 'undefined') {
                if ( this.props.customFetchValueFromData) {
                    val = this.props.customFetchValueFromData(data); 
                } else {
                    val = readNested (  data , this.props.fieldName); 
                }
            }
            if ( val === null || typeof val === 'undefined' ) {
                val = ''; 
            }
            if ( !isNull(updateState) && !updateState ) {
                st.valueHaveChange = true ;
            } else {
                st.value = val ; 
            }
        }); 
       
    }  
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        let el: HTMLElement =  document.getElementById(this.elementId)!;
        if ( el) {
            if ( this.props.customAssignValueToData) {
                this.props.customAssignValueToData(data , this.state.value); 
            } else {
                setValueHelper( data  , this.props.fieldName ,  this.state.value) ;  
            }
        } 
    }
    componentWillReceiveProps( nextProps: EditorTextboxProps  ) {
        if (! this.state.valueHaveChange ) {
            let swapState: any = this.state ; 
            swapState.value = nextProps.defaultValue ; 
        }
    }
    /**
     * component akan di attach. ini register component
     */
    componentWillMount () {
        let swapState: any = this.state ; 
        this.elementId = this.props.id || null! ;
        swapState.value = this.props.defaultValue ; 
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorTextbox.ID_COUNTER === -1) {
                EditorTextbox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_txt_' + EditorTextbox.ID_COUNTER ;
            EditorTextbox.ID_COUNTER += 1  ;
        }
        if ( this.props.registrarMethod != null && typeof  this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , false ); 
        }
        if ( this.props.className != null && typeof this.props.className !== 'undefined' && this.props.className !== '') {
            this.textboxClassName = this.props.className ; 
        }
        if ( this.props.registerVariableMethod && this.props.variableName ) {
            this.props.registerVariableMethod(this.props.variableName , this);
        }
        if ( this.props.readonlyCssName) {
            this.readonlyCssName = this.props.readonlyCssName ;
        }
    }

    /**
     * worker untuk unreg panel. di sini detach input dari editor
     */
    componentWillUnmount() {
        if ( this.props.registrarMethod != null && typeof  this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , true ); 
        }
        if ( this.props.registerVariableMethod && this.props.variableName) {
            this.props.registerVariableMethod(this.props.variableName , null);
        }
    }
    /**
     * membaca value dari input
     */
    getCurrentInputValue (): string  {
        let txtElSwap: any = document.getElementById(this.elementId) ;
        let   txtEl: HTMLInputElement = txtElSwap ; 
        let currentVal: string = txtEl.value ;
        return currentVal ;  
    }
    
    render () {
        let req: boolean = false ;
        if ( this.props.required != null && typeof this.props.required !== 'undefined') {
            req = this.props.required ; 
        }
        let dsb: boolean = this.props.disabled!; 
        if ( dsb == null || typeof dsb  === 'undefined') {
            dsb = false ; 
        }
        let defaultVal: string = this.state.value ; 
        let type: string = 'text'; 
        if ( this.props.inputType != null && typeof this.props.inputType !== 'undefined') {
            type = this.props.inputType; 
        }
        let cssSpan: string = this.props.cssForSpanTextboxWrapper! ; 
        if ( this.props.readonlyState) {
            if ( isNull(cssSpan)  ) {
                cssSpan = '' ; 
            }
            cssSpan += ' ' + this.readonlyCssName ; 
            if ( this.props.readonlyCssName && this.props.readonlyCssName.length > 0 )   {
                cssSpan += this.props.readonlyCssName;
            }
        }
        return ( this.props.readonlyState ?
        <span className={cssSpan}>{defaultVal}</span>
        : (
        <span  className={cssSpan} style={{paddingLeft: 0 , paddingRight : 0 }}>
        <input 
            type={type}
            value={defaultVal}
            id={this.elementId}
            disabled={dsb}
            required={req}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onChange={this.onChange}
            title={this.props.title}
            tabIndex={this.props.tabIndex}
            maxLength={this.props.maxLength}
            className={this.textboxClassName}
        />
        </span>
        )
    );
    }
    private onChange: (evt: any ) => void = (evt: any ) => {
        let val: string = evt.target.value  ; 
        this.setStateHelper ( 
            sln => {
                sln.value = val ; 
                sln.valueHaveChange = true ; 
            } , 
            () => {
                if ( this.props.changeHandler != null && typeof  this.props.changeHandler !== 'undefined') {
                    this.props.changeHandler(val) ;
                }
                if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
                    try {
                        this.forceReadDataFromControlMethod(); 
                    } catch ( exc ) {
                        console.error('[EditorTextbox] gagal update state data on change');
                    }
                }
            } );
        
    }
    private onBlur: (e: any) => void = (e: any) =>  {
        if ( this.props.onBlur == null || typeof this.props.onBlur === 'undefined') {
            return ; 
        }
        let txtValCurrent: string = this.getCurrentInputValue(); 
        let prevVal: string = this['beforeUserEntryValue'] || null; 
        this.props.onBlur(txtValCurrent , txtValCurrent !== prevVal , this);
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            if ( this['preEditValue'] !== e.target.value) {
                if (!( ! isNull( this.props.doNotUpdateEditorStateOnChange) && !this.props.doNotUpdateEditorStateOnChange)) {
                    this.forceReadDataFromControlMethod(false); 
                }
            }   
        }
    }

    private onFocus: (e: any) => void = (e: any) => {
        this['beforeUserEntryValue'] = this.getCurrentInputValue(); 
        if ( this.props.onFocus != null && typeof this.props.onFocus !== 'undefined') {
            this.props.onFocus(this);
        }
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
                this['preEditValue'] = e.target.value ; 

        }
    }
}