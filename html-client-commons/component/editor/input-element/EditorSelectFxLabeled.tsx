import * as React from "react" ;
import { CommonCommunicationData } from 'core-client-commons/index';
import {  CustomValidationFailureResult , ERROR_CODE_MANDATORY_VALIDATION_FAILED , 
    ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED , ERROR_MSG_MANDATORY_VALIDATION_FAILED } from './CommonsInputElement';
import { LabelOnlyEditorControl } from './LabelOnlyEditorControl';
import { isNull, readNested, setValueHelper , getCssForColumnWithScreenType , i18n , focusToDiv  } from '../../../utils/index';
import { EditorSelectFxProps , EditorSelectFxState } from './EditorSelectFx'; 
import { BaseSelectFxPanel } from '../../SelectFxPanel';

export interface EditorSelectFxLabeledProps extends EditorSelectFxProps {
    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;
    /**
     * label untuk di sebelah textbox
     */
    label: string ;
    /**
     * css untuk label. di default:col-xx-4 control-label 
     */
    cssLabel?: string ; 
    /**
     * css untuk div textbox. kalau misal di perlukan item tertentu untuk bagian ini 
     */
    cssDivTextbox  ?: string ;
    /**
     * flag di hidden atau tidak
     */
    hidden?: boolean ;
    /**
     * title dari data 
     */
    title?: string ;  
}

export interface EditorSelectFxLabeledState  extends EditorSelectFxState {}

/**
 * ini versi + label
 */
export class EditorSelectFxLabeled extends BaseSelectFxPanel<EditorSelectFxLabeledProps , EditorSelectFxLabeledState> {
    cssLabel: string ; 
    cssDivTextbox: string  ; 
    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';
    /**
     * validasi mandatory
     */
    runMandatoryValidationWorker: () => CustomValidationFailureResult ;
    readonlyLabelFormatter: (val: CommonCommunicationData.CommonLookupValue) => string ;
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   () => any ; 
    constructor(props: EditorSelectFxLabeledProps) {
        super(props) ; 
        let bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
        this.cssLabel = 'col-' + bootstrapColumnClass + '-4 control-label';
        this.cssDivTextbox = 'col-' + bootstrapColumnClass + '-8';
        this.readonlyLabelFormatter = (val: CommonCommunicationData.CommonLookupValue) => {
            if ( isNull(val)) {
                return null! ; 
            }
            return val.detailCode + ' - ' + val.label ;  
        };
        this.runMandatoryValidationWorker = () => {
            let rtvl: CustomValidationFailureResult =  null ! ; 
            if ( isNull(this.props.required)) {
                this.setStateHelper ( st => st.mandatoryValidationFailed = false );
                return rtvl ; 
            }
            
            if ( isNull(this.state.selectedData)) {
                console.error('[EditorSelectFx#runMandatoryValidationWorker] mandatory valication gagal. silakan di cek');
                let bsnsFieldName: string =  isNull(this.props.businessFieldName) ? this.props.fieldName  : this.props.businessFieldName ! ; 
                rtvl = {
                    fieldName: this.props.fieldName , 
                    businessFieldName: bsnsFieldName, 
                    erorrCode: ERROR_CODE_MANDATORY_VALIDATION_FAILED , 
                    errorMessage: i18n( ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED ,  ERROR_MSG_MANDATORY_VALIDATION_FAILED)
                        .split(':businessFieldName').join(bsnsFieldName)  , 
                    focusToCommand: this.focusToControl
                } ;
            }
            this.setStateHelper ( st =>  st.mandatoryValidationFailed = !rtvl );
            return rtvl; 
        };
        this.runMandatoryValidation = this.runMandatoryValidationWorker ;
    }

    runMandatoryValidation (): CustomValidationFailureResult {
         return this.runMandatoryValidationWorker() ; 
    }

    focusToControl: () => any = () => {
        focusToDiv(this.rootElementId); 
    }

    generateDefaultState (): EditorSelectFxState {
        return {
            expanded: false,
            selectedData: null!,
            mandatoryValidationFailed: false , 
            data : null!
        };
    }
    componentWillMount () {
        super.componentWillMount() ; 
        if ( this.props.cssLabel != null && typeof this.props.cssLabel !== 'undefined' && this.props.cssLabel !== '' ) {
            this.cssLabel = this.props.cssLabel ; 
        }
        if ( !isNull(this.props.registrarMethod)) {
            this.props.registrarMethod(this , false ); 
        }
        if ( !isNull(this.props.variableName) && ! isNull(this.props.registerVariableMethod)) {
            this.props.registerVariableMethod!( this.props.variableName! ,  this);
        }
        if ( this.props.cssDivTextbox != null && typeof this.props.cssDivTextbox !== 'undefined' && this.props.cssDivTextbox !== '' ) {
            this.cssDivTextbox = this.props.cssDivTextbox ; 
        }  
    }
    onDataSelected (data: CommonCommunicationData.CommonLookupValue ) {
        super.onDataSelected(data);
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            try {
                this.forceReadDataFromControlMethod(); 
            } catch ( exc ) {
                console.error('[EditorTextbox] gagal update state data on change');
            }
        }
    }
    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: () => any ): any {
        this.forceReadDataFromControlMethod = method ; 
        
    }

    assignDataToControl (data: any ) {
        let val: any  =  readNested ( data , this.props.fieldName) ;
        this.setValue(val) ; 
    }

    fetchDataFromControl(data: any ) {
        setValueHelper (   data , this.props.fieldName , this.getValue() ); 
    }

    render (): JSX.Element {
        let childNode: JSX.Element = null !; 
        if ( this.props.readonlyState) {
            let lbl: string = "" ; 
            if ( !isNull(this.state.selectedData)) {
                lbl = this.readonlyLabelFormatter(this.state.selectedData!);
            }
            return (
            <LabelOnlyEditorControl
                label={this.props.label}
                value={lbl}
                cssDivTextbox={this.readonlyCssName}
                cssLabel={this.props.cssLabel}
                hidden={this.props.hidden}
            >{childNode}
            </LabelOnlyEditorControl>);
            
        } else {
            if (!isNull(this.props.required) && this.props.required && this.state.mandatoryValidationFailed) {
                childNode =  this.rendererTaskCombo( { mandatoryValidationFailed: true  , errorMessage: this.props.mandatoryValidationFailedMessage }  );
                        
            }  else {
                childNode =  this.rendererTaskCombo({}); 
            }  
        }
        return (
        <LabelOnlyEditorControl 
            key={'label_' + this.rootId}
            label={this.props.label}
            value=''
            cssLabel={this.props.cssLabel}
            hidden={this.props.hidden}
        >{childNode}
        </LabelOnlyEditorControl>);
    }

}