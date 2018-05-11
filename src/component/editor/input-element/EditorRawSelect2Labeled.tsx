import * as React from "react" ;
import { CommonCommunicationData } from 'core-client-commons';
import { EditorInputElement , CustomMandatoryValidateEnabled ,  CustomValidationFailureResult , 
    ERROR_CODE_MANDATORY_VALIDATION_FAILED , ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED ,  ERROR_MSG_MANDATORY_VALIDATION_FAILED } from './CommonsInputElement';
import { i18n , isNull, readNested, setValueHelper  } from '../../../utils/index';
import { LabelOnlyEditorControl } from './LabelOnlyEditorControl';
import { BaseSearchableRawSelect2ComboBox , BaseSearchableRawSelect2ComboBoxProps , BaseSearchableRawSelect2ComboBoxState } from '../../BaseSearchableRawSelect2ComboBox';

export interface EditorRawSelect2LabeledProps  extends BaseSearchableRawSelect2ComboBoxProps { // BaseSearchableComboBoxProps {
    /**
     * nama variable utnuk field data
     */
    fieldName: string ;  
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (control: any , unregFlag ?: boolean ) => any ;
    /**
     * label untuk di sebelah textbox
     */
    label: string;
    /**
     * css untuk label. di default:col-xx-4 control-label 
     */
    cssLabel?: string;
    /**
     * css untuk div textbox. kalau misal di perlukan item tertentu untuk bagian ini 
     */
    cssDivTextbox?: string;
    /**
     * flag data berupa boolean atau bukan
     */
    isValueNumeric ?: boolean ; 
    /**
     * flag element required atau tidak
     */
    required ?: boolean ; 
    /**
     * business field name
     */
    businessFieldName ?: string ; 
    /**
     * message kalau mandatory validation gagal
     */
    mandatoryValidationFailedMessage ?: string ; 

    /**
     * css untuk label saat readonly
     */
    readonlyCssName ?: string  ; 
    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;
    /**
     * flag panel hidden atau tidak
     */
    hidden ?: boolean  ; 
    /**
     * readonly label formatter
     */
    readonlyLabelFormatter ?: (val: CommonCommunicationData.CommonLookupValue) => string ; 

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
export interface EditorRawSelect2LabeledState extends BaseSearchableRawSelect2ComboBoxState {// BaseSearchableComboBoxState{
    /**
     * di pakai kalau mandatory validation failed
     */
    mandatoryValidationFailed: boolean ; 
}

/**
 * editor select2 dengan label
 */
export class EditorRawSelect2Labeled extends BaseSearchableRawSelect2ComboBox<EditorRawSelect2LabeledProps, EditorRawSelect2LabeledState> implements EditorInputElement, CustomMandatoryValidateEnabled {
    
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ;

    constructor(props: EditorRawSelect2LabeledProps) {
        super(props); 
        props.registrarMethod(this) ; 
    }
    
    runMandatoryValidation(): CustomValidationFailureResult {
        if ( isNull(this.props.required) || !this.props.required) {
            return null !; 
        }
        let rtvl: CustomValidationFailureResult = null!; 
        if ( isNull(this.state.value)) {
            let bsnsFieldName: string =  isNull(this.props.businessFieldName) ? this.props.label  ! : this.props.businessFieldName  !; 
            rtvl = {
                fieldName : this.props.fieldName , 
                businessFieldName : bsnsFieldName, 
                erorrCode : ERROR_CODE_MANDATORY_VALIDATION_FAILED , 
                errorMessage : i18n( ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED ,  ERROR_MSG_MANDATORY_VALIDATION_FAILED)
                    .split(':businessFieldName').join(bsnsFieldName)  , 
                focusToCommand : this.focusToControl

            } ; 
        }
        if ( !isNull(rtvl) ) {
            this.setStateHelper(c => {
                c.mandatoryValidationFailed = true ; 
                return c ; 
            }  );
        }
        return rtvl ; 
    }
    
    assignDataToControl(data: any, updateState?: boolean) {
        let val: any = isNull(this.props.customFetchValueFromData) ?  (readNested(data , this.props.fieldName )  || null) : this.props.customFetchValueFromData!(data); 
        if ( !isNull(val )) {
            if ( !isNaN(val)) {
                val = val + '' ; 
            }
        }
        this.assignValue( val ); 
    }
    fetchDataFromControl(data: any) {
        let val: any = this.state.value ; 
        if ( !isNull(val) && !isNull(this.props.isValueNumeric) && this.props.isValueNumeric) {
            if ( isNaN(val)) {
                val = null ; 
            }
            val = val / 1 ; 
        }
        if ( isNull(this.props.customAssignValueToData)) {
            setValueHelper( data , this.props.fieldName ,  val ) ; 
        } else {
            this.props.customAssignValueToData!(data , val ) ; 
        }
    }

    generateDefaultState(): EditorRawSelect2LabeledState {
        return {
            value : null !, 
            valueLookup : null!, 
            valueRendered : null!, 
            lookupValueNotFound : false , 
            valueHaveSetted : false , 
            mandatoryValidationFailed : false
        }; 
    }
    
    componentWillUnmount() {
        this.props.registrarMethod(this , true ) ; 
    }
    setValue ( val: string ) {
        this.assignValue(val); 
    }

    render (): JSX.Element {
        if ( !isNull(this.props.readonlyState) && this.props.readonlyState ) {
            if ( !isNull(this.props.hidden) && this.props.hidden) {
                return <input type='hidden' key='select2_labeled_hidden'/>;
            }
            return (
            <LabelOnlyEditorControl 
                label={this.props.label}
                cssLabel={this.props.cssLabel}
                cssDivTextbox={this.props.cssDivTextbox}
                value={<span className={this.props.readonlyCssName}>{this.state.valueRendered}</span>}
            />
        );
        } else {
            let style: React.CSSProperties = {} ; 
            let propSPan: React.HTMLAttributes<any>  = {
                style : style
            }; 
            if ( !isNull(this.props.hidden) && this.props.hidden) {
                style.display = 'none';
            }
            if ( this.state.mandatoryValidationFailed ) {
                style.borderColor = 'red' ; 
                style.borderWidth = '1px'; 
                style.borderStyle = 'solid';
                if ( !isNull(this.props.mandatoryValidationFailedMessage)) {
                    propSPan.title = this.props.mandatoryValidationFailedMessage ; 
                } else {
                    propSPan.title = 'Ini hasr di isi'; 
                }
            }
            return (
            <LabelOnlyEditorControl 
                label={this.props.label}
                cssLabel={this.props.cssLabel}
                cssDivTextbox={this.props.cssDivTextbox}
                value={this.state.mandatoryValidationFailed ?   <span {...propSPan}>{this.renderUnPopupControl()}</span> : this.renderUnPopupControl()}
            />
            );
        }
    }
    builtinChangeHandler ( value: string  ) {
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            try {
                this.forceReadDataFromControlMethod(); 
            } catch ( exc ) {
                console.error('[EditorSelect2] gagal update state data on change.error : ' , exc);
            }
        }   
    }
}