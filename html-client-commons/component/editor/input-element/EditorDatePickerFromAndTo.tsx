
import * as React from "react" ;
import { DateUtils } from 'core-client-commons/index';
import { isNull , i18n  } from '../../../utils/index';
import { EditorInputElement , CustomInputElementValidator , CustomValidationFailureResult , HaveCustomValidatorInputElement } from './CommonsInputElement';
import { EditorDateTextbox } from './EditorDateTextbox'; 
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState } from '../../BaseHtmlComponent';

export interface EditorDatePickerFromAndToState extends BaseHtmlComponentState {
    valueFrom: Date ; 
    valueTo: Date ;
}
/**
 * date picker from + to 
 */
export interface EditorDatePickerFromAndToProps extends BaseHtmlComponentProps , HaveCustomValidatorInputElement {
    /**
     * nama field. untuk bagian from
     */
    fieldNameFrom: string ;
    /**
     * css name untuk label readonly
     */
    readonlyCssName ?: string ;
    /**
     * nama field. untuk bagian to
     */
    fieldNameTo: string ;

    /**
     * nama class yang di pakai textbox
     */
    className ?: string ;

    /**
     * title untuk hint dalam textbox. untuk bagian from
     */
    titleFrom ?: string ;

    /**
     * title untuk hint dalam textbox. untuk bagian to
     */
    titleTo ?: string ;
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
    registrarMethod: (component: any , unregFlag ?: boolean ) => any ; 

    /**
     * change handler untuk textbox
     */
    changeHandlerFrom ?: (value: Date ) => any ;

    /**
     * change handler to
     */
    changeHandlerTo ?: (value: Date ) => any ;
    /**
     * id dari text box
     */
    id?: string ;
    /**
     * tgl awal datepicker
     */
    fromStartDate ?: Date ; 

    /**
     * tgl maks applikasi 
     */
    fromEndDate ?: Date ; 

    /**
     * array tanggal yang di disabled
     */
    fromDatesDisabled ?: Date[] ;

    /**
     * tgl awal datepicker
     */
    toStartDate ?: Date ; 

    /**
     * tgl maks applikasi 
     */
    toEndDate ?: Date ; 

    /**
     * array tanggal yang di disabled
     */
    toDatesDisabled ?: Date[] ;
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
     * flag required untuk from 
     */
    fromDateRequired ?: boolean ; 

    /**
     * flag date to required atau tidak
     */
    toDateRequired ?: boolean ; 
    /**
     * nama field bisnis
     */
    businessFieldName  ?: string ; 
    /**
     * custom handler fetch / getter untuk date from 
     */
    dateFromCustomHandler ?: {
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
    };

    /**
     * custom handler untuk fetch get date to 
     */
    dateToCustomHandler ?: {
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
    };
}
/**
 * date picker from + to
 */
export class EditorDatePickerFromAndTo extends BaseHtmlComponent <EditorDatePickerFromAndToProps , EditorDatePickerFromAndToState> implements EditorInputElement , CustomInputElementValidator {
    static  ID_COUNTER: number = -1 ; 
    elementIdFrom: string ; 
    elementIdTo: string ;
    textboxCssName: string = 'input-sm form-control'; 
    constructor(props: EditorDatePickerFromAndToProps) {
        super(props) ; 
        this.state = {
            valueFrom : null  !, 
            valueTo : null! 
        };
    }
    /**
     * command untuk focus ke control
     */
    focusToControlCommand: () => any = () => {
        let el: any = document.getElementById(this.elementIdFrom)! ; 
        if ( !isNull(el)) {
            let inpEL: HTMLInputElement = el ;
            inpEL.focus(); 
        }
    }
    runCustomValidation(): CustomValidationFailureResult|Array<CustomValidationFailureResult> {
        let rtvl: Array<CustomValidationFailureResult>  =  [] ; 
        
        if  ( !isNull(this.props.customValidator)) {
            let rslt: any = this.props.customValidator!({
                fieldName : this.props.fieldNameFrom , 
                focusToControl : this.focusToControlCommand 
            }); 
            if ( !isNull(rslt)) {
                if ( Array.isArray(rslt)) {
                    rtvl.push(...rslt) ; 
                } else {
                    rtvl.push(rslt); 
                }
            }
        }
        if ( !isNull(this.state.valueFrom ) && !isNull(this.state.valueTo)) {
            if ( this.state.valueFrom > this.state.valueTo) {
                rtvl.push( {
                    businessFieldName : isNull(this.props.businessFieldName) ? this.props.fieldNameFrom ! : this.props.businessFieldName! , 
                    erorrCode : 'INVALID_RANGE' , 
                    errorMessage : i18n('core.component.date_from_to.invalid-range' , 'Tgl dari lebih besar daripada tanggal sampai') , 
                    fieldName : this.props.fieldNameFrom !, 
                    focusToCommand : this.focusToControlCommand!
                }); 
            }
        }
        if ( rtvl.length === 0 ) {
            return null !;
        }
        if ( rtvl.length === 1 ) {
            return rtvl[0] ; 
        }
        return rtvl ; 
    }

    componentWillUnMount () {
        if ( this.props.registrarMethod != null && typeof  this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , true ); 
        } 
    }
    componentWillMount () {
        if ( this.props.className != null && typeof this.props.className !== 'undefined' && this.props.className.length > 0 ) {
            this.textboxCssName = this.props.className ;
        }
        if ( this.props.id != null && typeof  this.props.id !== 'undefined' && this.props.id.length > 0 ) {
            this.elementIdFrom = this.props.id  +  '_from';
            this.elementIdTo = this.props.id + '_to' ; 
        } else {
            if ( EditorDatePickerFromAndTo.ID_COUNTER === -1) {
                EditorDatePickerFromAndTo.ID_COUNTER  = new Date().getTime() ; 
            }
            let id: string = 'core_framework_txt_' + EditorDatePickerFromAndTo.ID_COUNTER;
            this.elementIdFrom = id  +  '_from';
            this.elementIdTo = id + '_to' ; 
            EditorDatePickerFromAndTo.ID_COUNTER = EditorDatePickerFromAndTo.ID_COUNTER + 1 ;  
        }
        if ( this.props.registrarMethod != null && typeof  this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , false );
        }
    }

    rendererReadonly () {
        let txtFrom: string = '' ; 
        let txtTo: string = '' ; 
        if (  this.state.valueFrom != null && typeof  this.state.valueFrom !== 'undefined') {
           txtFrom =  DateUtils.formatDate(this.state.valueFrom , this.props.dateformat == null || typeof  this.props.dateformat === 'undefined' ? 'mm/dd/yyyy' : this.props.dateformat); 
        }
        if (  this.state.valueTo != null && typeof  this.state.valueTo !== 'undefined') {
            txtTo = DateUtils.formatDate(this.state.valueTo , this.props.dateformat == null || typeof  this.props.dateformat === 'undefined' ? 'mm/dd/yyyy' : this.props.dateformat); 
        }

        let actualLabel: string = txtFrom ;
        if ( actualLabel.length > 0 && txtTo.length > 0) {
            actualLabel = actualLabel + ' s.d ' ; 
        } 
        actualLabel += txtTo ; 
        return (<span key={'date_readonly_from_to' + this.elementIdFrom}>{actualLabel}</span>); 
    }

    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean ) {
        if (! this.props.readonlyState) {
            return ; 
        }
        let dtFrom: any = data[this.props.fieldNameFrom]  ; 
        if ( dtFrom != null && typeof dtFrom  === 'string') {
            dtFrom = new Date(dtFrom + '');
        }
        let dtTo: any = data[this.props.fieldNameTo]  ; 
        if ( dtTo != null && typeof dtTo  === 'string') {
            dtTo = new Date(dtTo + '');
        }
        if (!( !isNull(updateState) && !updateState) ) {
            this.setStateHelper( 
            st => {
                st.valueFrom  =  dtFrom  ;  
                st.valueTo  = dtTo  ;
            });
        }
        
    } 

    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        //
    }

    protected onChangeDateFrom: (dt: Date ) => any = (dt: Date ) => {
        if ( this.props.changeHandlerFrom != null && typeof this.props.changeHandlerFrom !== 'undefined') {
            this.props.changeHandlerFrom(dt); 
        }
        this.setStateHelper ( st => {
            st.valueFrom = dt ; 
        });
    }
    protected onChangeDateTo: (dt: Date ) => any = (dt: Date ) => {
        if ( this.props.changeHandlerTo != null && typeof this.props.changeHandlerTo !== 'undefined') {
            this.props.changeHandlerTo(dt); 
        }
        this.setStateHelper ( st => {
            st.valueTo = dt ; 
        });
    }
    rendererEditable () {
        return (
        <div  key={'date_from_to_editable_' + this.elementIdFrom}  className="input-daterange input-group">
            <EditorDateTextbox
                fieldName={this.props.fieldNameFrom}
                className={this.textboxCssName}
                title={this.props.titleFrom}
                tabIndex={this.props.tabIndex} 
                readonlyState={false}
                readonlyCssName={this.props.readonlyCssName}
                registrarMethod={this.props.registrarMethod}
                customAssignValueToData={!isNull(this.props.dateFromCustomHandler) ?  this.props.dateFromCustomHandler!.customAssignValueToData! :  null !}
                customFetchValueFromData={!isNull(this.props.dateFromCustomHandler) ?  this.props.dateFromCustomHandler!.customFetchValueFromData! :  null!}
                changeHandler={this.onChangeDateFrom} 
                startDate={this.props.fromStartDate} 
                endDate={this.props.fromEndDate}
                datesDisabled={this.props.fromDatesDisabled}
                dateformat={this.props.dateformat}
                id={this.elementIdFrom}
                required={this.props.fromDateRequired}
            />
            <span className="input-group-addon"><i className="fa fa-exchange"/></span>
            <EditorDateTextbox
                fieldName={this.props.fieldNameTo}
                className={this.textboxCssName}
                title={this.props.titleTo}
                tabIndex={this.props.tabIndex + 1}
                readonlyState={false}
                registrarMethod={this.props.registrarMethod}
                readonlyCssName={this.props.readonlyCssName}
                customAssignValueToData={!isNull(this.props.dateToCustomHandler) ?  this.props.dateToCustomHandler!.customAssignValueToData :  null!}
                customFetchValueFromData={!isNull(this.props.dateToCustomHandler) ?  this.props.dateToCustomHandler!.customFetchValueFromData :  null!}
                changeHandler={this.onChangeDateTo} 
                startDate={this.props.toStartDate}
                endDate={this.props.toEndDate}
                datesDisabled={this.props.toDatesDisabled}
                dateformat={this.props.dateformat}
                id={this.elementIdTo}
                required={this.props.toDateRequired}
            />    
                    
                </div>); 
    }

    render() {
        if ( this.props.readonlyState) {
            return this.rendererReadonly() ; 
        } else {
            return this.rendererEditable(); 
        }
        
    }

}