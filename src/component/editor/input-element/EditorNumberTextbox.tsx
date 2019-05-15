import * as React from "react" ;
import { isNull  ,   readNested, setValueHelper } from 'base-commons-module';
import { FormatterUtils  } from '../../../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../../BaseHtmlComponent';
export interface EditorNumberTextboxProps extends BaseHtmlComponentProps {
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
     * nilai maksimal dari data
     */
    max ?: number ; 
    /**
     * nilai minimal dari data
     */
    min ?: number ; 

    /**
     * flag format money 
     */
    isMoney?: boolean ;

    /**
     * css name untuk label readonly
     */
    readonlyCssName ?: string ;
    /**
     * flag control mandatory atau tidak
     */
    required?: boolean ; 

    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: EditorNumberTextbox , unregFlag?: boolean ) => any ; 

    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: number ) => any ;

    /**
     * id dari text box
     */
    id?: string ;
    /**
     * disabled atau tidak
     */
    disabled ?: boolean ;

    /**
     * method untuk register variable
     */
    registerVariableMethod ?: (varName: string , textbox: EditorNumberTextbox ) => any ; 
    /**
     * nama variable untuk di register ke parent
     */
    variableName?: string ; 
    /**
     * element children dari data
     */
    children ?: any ; 

    /**
     * flag untuk tidak me render
     */
    doNotRenderIf ?: boolean ; 

    /**
     * nilai awal dari data
     */
    defaultValue ?: number ; 
    /**
     * fetched id dari attribute dari data
     * @return id dari product yang di pilih. kalau ada reference ke product, sekalian di kirimkan , kalau tidak yang di isikan cuma id dari product
     */
    customFetchValueFromData?: (data: any) => number;
    /**
     * assign data dari control ke data
     * @param targetData  kemana data akan di salin
     * @param value value di salin ke control
     */
    customAssignValueToData?: (targetData: any, value: number ) => any;
}
export interface EditorNumberTextboxState extends BaseHtmlComponentState {
    value: number ;
}

export class EditorNumberTextbox  extends BaseHtmlComponent<EditorNumberTextboxProps , EditorNumberTextboxState> {

    static ID_COUNTER: number   = -1;
    static FORMATTER: FormatterUtils = new FormatterUtils() ; 
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ; 
    /**
     * nama textbox untuk class 
     */
    textboxClassName: string = 'form-control';
    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';

    private elementId: string ;
    constructor(props: EditorNumberTextboxProps) {
        super( props) ;
        this.state = {value: 0} ;
        let swapState: any = this.state ; 
        swapState.value = isNull(props.defaultValue) || isNaN(props.defaultValue!)  ? 0 : props.defaultValue ; 
        this.elementId = props.id || null! ;
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorNumberTextbox.ID_COUNTER === -1) {
                EditorNumberTextbox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_txt_' + EditorNumberTextbox.ID_COUNTER ;
            EditorNumberTextbox.ID_COUNTER += 1  ;
        }
        if ( props.registrarMethod != null && typeof  props.registrarMethod !== 'undefined') {
            props.registrarMethod(this , false ); 
        }
        if ( !isNull( props.className) ) {
            this.textboxClassName = props.className !; 
        }
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any ) {
       let val: number = null! ;
       if ( !isNull(this.props.customFetchValueFromData)) {
            val = this.props.customFetchValueFromData!(data); 
       } else {
            if ( data != null && typeof  data !== 'undefined') {
                val = readNested( data  , this.props.fieldName); 
            }
       }
       this.setStateHelper (st => st.value = val  ); 
    }  

    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        let el: HTMLElement =  document.getElementById(this.elementId)!;
        if ( el != null) {
            let val: any = el['value'] ; 
            if ( isNaN(val)) {
                val = null;
            } else {
                val = val / 1 ; 
            }
            if ( !isNull(this.props.customAssignValueToData)) {
                this.props.customAssignValueToData!(data , val); 
            } else {
                setValueHelper( data  , this.props.fieldName ,  val) ;  
            }
        } 
    }
    /**
     * worker untuk unreg panel. di sini detach input dari editor
     */
    componentWillUnmount() {
        if ( this.props.registrarMethod != null && typeof  this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , true ); 
        }
    }
    /**
     * assign value ke dalam control langsung
     */
    assignValue (n: number ) {
        this.setStateHelper ( st => {
            st.value = n ; 
        });
    }

    rendererTaskReadonlySpan() {
        let renderedTxt: string = '' ; 
        if ( this.props.isMoney) {
            if ( this.state.value != null && typeof this.state.value !== 'undefined' ) {
                if ( this.state.value === 0) {
                    renderedTxt = '0' ; 
                }
                renderedTxt =  EditorNumberTextbox.FORMATTER.formatMoney(this.state.value) ;
                if ( this.state.value < 0 ) {
                    renderedTxt = '- ' + renderedTxt ;  
                }
            }
        } else {
            if ( this.state.value != null && typeof this.state.value !== 'undefined') {
                renderedTxt = this.state.value + '' ;
            } else {
                renderedTxt = '' ;
            }
        }
        return <span className={!isNull(this.props.readonlyCssName) && this.props.readonlyCssName!.length > 0 ? this.props.readonlyCssName :    this.readonlyCssName}>{renderedTxt}</span>;
    }
    
    render () {
        if ( !isNull(this.props.doNotRenderIf) && this.props.doNotRenderIf) {
            return <input type='hidden'/>;
        }
        let defaultVal: string = this.state.value == null ? '' : this.state.value + '' ; 
        let required: boolean = false ;
        if ( this.props.required != null && typeof this.props.required !== 'undefined') {
            required = this.props.required ; 
        }
        return ( this.props.readonlyState ?
        this.rendererTaskReadonlySpan()
        : (
        <span>
        <input 
            type='number'
            required={required}
            style={{textAlign: 'right'}}
            value={defaultVal}
            disabled={this.props.disabled == null || typeof this.props.disabled ? false : this.props.disabled}
            id={this.elementId}
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            title={this.props.title}
            tabIndex={this.props.tabIndex}
            min={this.props.min}
            max={this.props.max}
            className={this.textboxClassName}
        /></span>)
         );
    }
    private onFocus: (evt: any ) => void = (evt: any ) => {
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            this['preEditValue'] = evt.target.value ; 
        }
    }
    private onBlur: (evt: any ) => void =  (evt: any ) => {
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            if ( this['preEditValue'] !== evt.target.value) {
                if (!( ! isNull( this.props.doNotUpdateEditorStateOnChange) && !this.props.doNotUpdateEditorStateOnChange)) {
                this.forceReadDataFromControlMethod(false); 
                }
            }
        }
    }
    private onChange: (evt: any ) => void = (evt: any ) => {
        let val: any = evt.target.value  ; 
        if ( isNaN(val)) {
            val = null ; 
        } else {
            val = val / 1 ; 
        }
        this.setStateHelper ( 
            st => {
                st.value = val; 
            } ,
            () => {
            if ( this.props.changeHandler != null && typeof  this.props.changeHandler !== 'undefined') {
                this.props.changeHandler( val) ;
            }
            if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
                let upd: boolean = true ; 
                if ( ! isNull( this.props.doNotUpdateEditorStateOnChange) && !this.props.doNotUpdateEditorStateOnChange) {
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

}