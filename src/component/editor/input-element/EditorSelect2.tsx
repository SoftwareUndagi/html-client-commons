import * as React from "react" ;
import { CommonCommunicationData , isNull } from 'core-client-commons';
import { EditorInputElement , CustomMandatoryValidateEnabled , CustomValidationFailureResult , ERROR_CODE_MANDATORY_VALIDATION_FAILED , 
        ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED , ERROR_MSG_MANDATORY_VALIDATION_FAILED } from './CommonsInputElement';
import {  readNested, setValueHelper  , i18n } from '../../../utils/index';
import { BaseSearchableComboBox , BaseSearchableComboBoxProps , BaseSearchableComboBoxState } from '../../BaseSearchableComboBox';

export interface EditorSelect2Props extends BaseSearchableComboBoxProps {
    /**
     * nama variable utnuk field data
     */
    fieldName: string ;  
    /**
     * flag data berupa boolean atau bukan
     */
    isValueNumeric ?: boolean ; 
    /**
     * flag element required atau tidak
     */
    required ?: boolean ; 
    /**
     * nama bisnis dari field. untuk error messaging
     */
    businessFieldName ?: string ; 

    /**
     * message kalau mandatory validation gagal
     */
    mandatoryValidationFailedMessage ?: string ; 
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (control: any , unregFlag ?: boolean ) => any ;
    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;
    /**
     * css untuk label saat readonly
     */
    readonlyCssName ?: string  ; 
    /**
     * readonly label formatter
     */
    readonlyLabelFormatter ?: (val: CommonCommunicationData.CommonLookupValue) => string ; 

    /**
     * fetched id dari attribute dari data
     * @return id dari product yang di pilih. kalau ada reference ke product, sekalian di kirimkan , kalau tidak yang di isikan cuma id dari product
     */
    customFetchValueFromData?: (data: any) => string ;
    /**
     * assign data dari control ke data
     * @param targetData  kemana data akan di salin
     * @param value value di salin ke control
     */
    customAssignValueToData?: (targetData: any, value: string|number ) => any;
} 
export interface EditorSelect2State extends BaseSearchableComboBoxState {
    /**
     * di pakai kalau mandatory validation failed
     */
    mandatoryValidationFailed: boolean ; 
}

/**
 * editor select 2
 */
export class EditorSelect2 extends BaseSearchableComboBox<EditorSelect2Props, EditorSelect2State>/*BaseSearchableComboBox<EditorSelect2Props, EditorSelect2State>*/ implements EditorInputElement, CustomMandatoryValidateEnabled {
    generateDefaultState(): EditorSelect2State {
        return {
            value: null!,
            valueLookup: null!,
            valueRendered: null!,
            lookupValueNotFound: false,
            valueHaveSetted: false,
            mandatoryValidationFailed: false,
            dropDownShowed: 'none'
        };
    }
    
    runMandatoryValidation(): CustomValidationFailureResult {
        if ( isNull(this.props.required) || !this.props.required) {
            return null !; 
        }
        let rtvl: CustomValidationFailureResult = null !; 
        if ( isNull(this.state.value)) {
            let bsnsFieldName: string =  isNull(this.props.businessFieldName) ? this.props.fieldName  : this.props.businessFieldName ! ; 
            rtvl = {
                fieldName : this.props.fieldName , 
                businessFieldName : bsnsFieldName, 
                erorrCode : ERROR_CODE_MANDATORY_VALIDATION_FAILED , 
                errorMessage : i18n( ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED ,  ERROR_MSG_MANDATORY_VALIDATION_FAILED)
                    .split(':businessFieldName').join(bsnsFieldName)  , 
                focusToCommand : this.focusToControl

            } ; 
        }
        if ( this.state.mandatoryValidationFailed !== !rtvl) {
            this.setStateHelper(c => {
                c.mandatoryValidationFailed = true ; 
                return c ; 
            }  );
        }
        return rtvl ; 
    }

    assignDataToControl(data: any, updateState?: boolean) {
        let val: any = isNull(this.props.customFetchValueFromData) ? readNested(data, this.props.fieldName) : this.props.customFetchValueFromData!(data);
        if (!isNull(val)) {
            if (!isNaN(val)) {
                val = val + '';
            }
        }
        this.assignValue(val);
    }

    fetchDataFromControl(data: any) {
        let val: any = this.state.value;
        if (!isNull(val) && !isNull(this.props.isValueNumeric) && this.props.isValueNumeric) {
            if (isNaN(val)) {
                val = null;
            }
            val = val / 1;
        }
        if (isNull(this.props.customAssignValueToData)) {
            setValueHelper(data, this.props.fieldName, val);
        } else {
            this.props.customAssignValueToData!(data, val);
        }
    }

    componentWillMount() {
        super.componentWillMount();
        this.props.registrarMethod(this);
    }

    componentWillUnmount() {
        this.props.registrarMethod(this, true);
    }

    render() {
        if (!isNull(this.props.readonlyState) && this.props.readonlyState) {
            return <span className={this.props.readonlyCssName}>{this.state.valueRendered}</span>;
        }
        if (isNull(this.props.required) || !this.props.required) {
            return super.render();
        }
        let style: React.CSSProperties = {};
        let propSPan: React.HTMLAttributes<any> = {
            style: style
        };
        if (this.state.mandatoryValidationFailed) {
            style.borderColor = 'red';
            style.borderWidth = '1px';
            style.borderStyle = 'solid';

            if (!isNull(this.props.mandatoryValidationFailedMessage)) {
                propSPan.title = this.props.mandatoryValidationFailedMessage;
            } else {
                propSPan.title = 'Ini harus di isi';
            }
        }
        return <span {...propSPan}>{super.render()}</span>;
    }
    
}