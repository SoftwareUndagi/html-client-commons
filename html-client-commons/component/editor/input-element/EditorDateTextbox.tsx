
import * as React from "react" ;
import { FormatterUtils  } from '../../../utils/index';
import {  isNull , readNested , setValueHelper , EditorInputElement } from 'core-client-commons/index' ;
import { DatePickerWrapper , DatePickerWrapperProps } from '../../DatePickerWrapper';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../../BaseHtmlComponent';

export class CalendarIconProps {
    clickHandler: () => any ; 
}

export class CalendarIconState {
    hovered: boolean ; 
}

export class CalendarIcon extends BaseHtmlComponent<CalendarIconProps , CalendarIconState> {
    constructor(props: CalendarIconProps) {
        super(props) ; 
        this.state = { hovered : false};
    }

    render (): JSX.Element  {
        let css: string = 'fa fa-calendar bigger-110 ' + (this.state.hovered ? 'green' : '');
        return (
        <span 
            className="input-group-addon"
            onMouseEnter={this.onMouseEnter}  
            onMouseLeave={this.onMouseLeave}
            onClick={this.onClick} 
        >
            <i style={{cursor: 'pointer'}} className={css}/>
        </span>
        );
    }

    private onMouseEnter: () => any = () => {
        this.setStateHelper ( st => st.hovered = true );
    }
    private onMouseLeave: () => any = () => {
        this.setStateHelper ( st => st.hovered = true );
    }
    private onClick: () => any = () => {
        this.setStateHelper ( st => st.hovered = true );
    }

}

/**
 * propserty editor textbox
 */
export interface  EditorDateTextboxProps extends BaseHtmlComponentProps {

    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;
    /**
     * nama variable untuk textbox. untuk di akses oleh parent
     */
    variableName?: string ;
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
    title ?: string ;
    /**
     * index dari tab
     */
    tabIndex: number  ;
    /**
     * state readonly atau tidak
     */
    readonlyState: boolean  ;
    /**
     * flag required atau tidak
     */
    required ?: boolean ; 
    /**
     * initial value untuk date picker
     */
    initalValue ?: Date ; 
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: EditorDateTextbox , unregFlag ?: boolean ) => any ; 
    /**
     * change handler untuk textbox
     */
    changeHandler ?: (value: Date ) => any ;
    /**
     * id dari text box
     */
    id?: string ;
    /**
     * tgl awal datepicker
     */
    startDate ?: Date ;
    /**
     * tgl maks applikasi 
     */
    endDate ?: Date ; 
    /**
     * array tanggal yang di disabled
     */
    datesDisabled ?: Date[] ; 
    /**
     * default : dd/mm/yyyy
     */
    dateformat ?: string ; 
    /**
     * element children dari data
     */
    children ?: any ; 
    key ?: string ;

    /**
     * css name untuk label readonly
     */
    readonlyCssName ?: string ;

    /**
     * pas tekan enter di submit atau tidak. default = false 
     */
    invokeSubmitOnEnter ?: boolean ; 

    /**
     * fetched id dari attribute dari data
     * @return id dari product yang di pilih. kalau ada reference ke product, sekalian di kirimkan , kalau tidak yang di isikan cuma id dari product
     */
    customFetchValueFromData?: (data: any) => Date;
    /**
     * assign data dari control ke data
     * @param targetData  kemana data akan di salin
     * @param value value di salin ke control
     */
    customAssignValueToData?: (targetData: any, value: Date ) => any;
}

/**
 * state editor textbox
 */
export interface  EditorDateTextboxState extends BaseHtmlComponentState {

    /**
     * value internal dari date. untuk di keep dan proses
     */
    internalValue: Date ; 
}
/**
 * bootstrap date picker wrapper untuk app 
 */
export class EditorDateTextbox extends BaseHtmlComponent<EditorDateTextboxProps , EditorDateTextboxState > implements EditorInputElement {

    static ID_COUNTER: number = -1 ; 

    elementId: string ; 

    datePicker: DatePickerWrapper ; 

    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState ?: boolean) => any ; 

    /**
     * pattern date 
     */
    datePattern: string = 'dd/mm/yyyy'; 
    cssName: string = 'form-control date-picker'  ;
    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';

    constructor(props: EditorDateTextboxProps) {
        super(props) ; 
        this.state = {
            internalValue : props.initalValue!
        };
        this.elementId =    this.props.id ! ;
        if (  isNull(this.elementId) || this.elementId.length === 0 ) {
            if ( EditorDateTextbox.ID_COUNTER === -1) {
                EditorDateTextbox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_date_picker_' + EditorDateTextbox.ID_COUNTER ;
            EditorDateTextbox.ID_COUNTER += 1  ;
        }
        if ( props.registrarMethod != null && typeof  props.registrarMethod !== 'undefined') {
            props.registrarMethod(this , false ); 
        }
        if ( props.dateformat != null && typeof props.dateformat !== 'undefined' && props.dateformat.length > 0) {
            this.datePattern = props.dateformat ; 
        }
        if ( props.className != null && typeof props.className !== 'undefined') {
            this.cssName = props.className ; 
        }
        if ( !isNull(this.props.readonlyCssName)) {
            this.readonlyCssName = this.props.readonlyCssName! ;
        }
    }
    show()  {
        this.datePicker.show();
    }
    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState ?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean )  {
        let val: Date =  isNull(this.props.customFetchValueFromData) ?  (readNested(data , this.props.fieldName )  || null) : this.props.customFetchValueFromData!(data); 
        let orgVal: any = val ;
        if ( val != null  ) {
            if ( typeof val === 'string' ) {
                try {
                    val = new Date(val + '')  ; 
                } catch (exc) {
                    console.error('[EditorDateTextbox] gagal parsing date dari form untuk val : ' , orgVal) ; 
                }
            }
            if ( val == null  ) {
                var v: any = {} ; 
                val = v ;
            }
            if ( val['getTime'] == null || typeof val.getTime === 'undefined') {
                val = null! ;
                setValueHelper( data , this.props.fieldName ,  null) ;  
            }
        }
        this.value = val ;   
        
    }
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        let key: string = this.props.fieldName ;  
        let val: Date = this.value   ; 
        if ( isNull(this.props.customAssignValueToData)) {
            setValueHelper( data , key ,  val ) ; 
        } else {
            this.props.customAssignValueToData!(data , val ) ; 
        }
    }  
    changeHandler: (val: Date ) => void = (val: Date ) => {
        if ( this.state.internalValue !== val) {
            this.setStateHelper( st => st.internalValue = val );
        }
        if ( !isNull(this.props.changeHandler )) {
            this.props.changeHandler!(val);
        }
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            try {
                this.forceReadDataFromControlMethod(); 
            } catch ( exc ) {
                console.error('[EditorDateTextbox] gagal update state data on change');
            }
        }
    }
    dateFormatter: (value: Date) =>  string = (value: Date) => {
        let f: FormatterUtils = new FormatterUtils() ; 
        return f.formatDate( value , this.props.dateformat) ; 
    }
    render () {
        let req: boolean = false ;
        if ( this.props.required != null && typeof this.props.required !== 'undefined') {
            req = this.props.required ; 
        }
        let props: DatePickerWrapperProps = {
            minMate : this.props.startDate , 
            maxDate : this.props.endDate , 
            initalValue: this.state.internalValue , 
            customSubmitCommand  :  null! ,
            invokeSubmitOnDateSelected : false , 
            invokeSubmitOnEnter : this.props.invokeSubmitOnEnter ,
            className : this.props.className , 
            changeHandler : this.changeHandler, 
            tabIndex : this.props.tabIndex , 
            required : req , 
            readonlyState : this.props.readonlyState , 
            title : this.props.title , 
            datesDisabled : this.props.datesDisabled , 
            id : this.elementId

        }; 
        if ( !isNull(this.props.dateformat)) {
            props.dateFormatter = this.dateFormatter ; 
        }

        if ( this.props.readonlyState) {
            let lbl: string = '' ; 
            if ( !isNull(this.state.internalValue)) {
                lbl =  DatePickerWrapper.DEFAULT_FORMATTER(this.state.internalValue);
            } 
            return <span className={this.readonlyCssName}>{lbl}</span> ;
        }
        
        return <DatePickerWrapper  ref={(d: any) => this.datePicker = d!} {...props}/>;
    }
    /**
     * setter value dari data
     */
    set value (value: Date ) {
        if ( this.state.internalValue === value) {
            return ; 
        }
        if (!isNull(this.datePicker)) {
            this.datePicker.assignValue(value);
            this.setStateHelper( st => {
                st.internalValue = value ;  
            }  ); 
        } else {
            let s: EditorDateTextboxState = this.state ; 
            s.internalValue = value ; 
        }
    }

    /**
     * getter date
     */
    get value (): Date {
        return this.state.internalValue ; 
    }

}