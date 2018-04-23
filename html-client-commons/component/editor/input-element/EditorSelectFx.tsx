import * as React from "react" ;
import { CommonCommunicationData , isNull }  from 'core-client-commons/index';
import { EditorInputElement , CustomMandatoryValidateEnabled  , CustomValidationFailureResult , ERROR_CODE_MANDATORY_VALIDATION_FAILED , 
    ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED , ERROR_MSG_MANDATORY_VALIDATION_FAILED } from './CommonsInputElement';
import {  readNested, setValueHelper  , i18n , focusToDiv  } from '../../../utils/index';
import { BaseSelectFxPanel , SelectFxPanelProps , SelectFxPanelState } from '../../SelectFxPanel';

export interface EditorSelectFxState extends SelectFxPanelState {
    /**
     * flag validasi mandatory gagal atau tidak
     */
    mandatoryValidationFailed: boolean ; 
}

export interface EditorSelectFxProps extends SelectFxPanelProps {
    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;

    /**
     * nama variable utnuk field data
     */
    fieldName: string ;  

    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: any , unregFlag?: boolean ) => any ;
    /**
     * formatter label readonly. untuk di tampilkan pada saat mode view detail
     */
    readonlyLabelFormatter ?: (val: CommonCommunicationData.CommonLookupValue) => string  ; 

    /**
     * state readonly dari data
     */
    readonlyState: boolean ;

    /**
     * flag element required atau tidak
     */
    required ?: boolean;

    /**
     * message kalau mandatory validation gagal
     */
    mandatoryValidationFailedMessage ?: string ;

    /**
     * nama variable untuk di register
     */
    variableName ?: string ; 

    /**
     * untuk register ke parent
     */
    registerVariableMethod  ?: (variableName: string , control: any  ) => any ; 
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
    /**
     * nama field bisnis. untuk validasi
     */
    businessFieldName ?: string ; 
}
/**
 * control wrapper select fx. ini dengan span. versi ini ada readonly atau tidak nya
 */
export class EditorSelectFx extends BaseSelectFxPanel<EditorSelectFxProps , EditorSelectFxState> implements EditorInputElement , CustomMandatoryValidateEnabled {
    readonlyLabelFormatter: (val: CommonCommunicationData.CommonLookupValue) => string ;

    /**
     * css name untuk label readonly
     */
    readonlyCssName: string = 'labelOnView';

    /**
     * validasi mandatory
     */
    runMandatoryValidationWorker: () => CustomValidationFailureResult ;
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ;
    constructor(props: EditorSelectFxProps) {
        super(props) ;
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
                    fieldName : this.props.fieldName , 
                    businessFieldName : bsnsFieldName, 
                    erorrCode : ERROR_CODE_MANDATORY_VALIDATION_FAILED , 
                    errorMessage : i18n( ERROR_MSG_I18N_MANDATORY_VALIDATION_FAILED ,  ERROR_MSG_MANDATORY_VALIDATION_FAILED)
                        .split(':businessFieldName').join(bsnsFieldName)  , 
                    focusToCommand : this.focusToControl
                } ;
            }
            this.setStateHelper ( st => st.mandatoryValidationFailed = !rtvl );
            return rtvl;  
        };
        this.runMandatoryValidation = this.runMandatoryValidationWorker ;
        if ( !isNull(props.readonlyLabelFormatter)) {
            this.readonlyLabelFormatter = props.readonlyLabelFormatter !; 
        } 
        if ( !isNull(props.registrarMethod)) {
            props.registrarMethod(this , false ); 
        } else {
            console.warn('[EditorSelectFx] maaf, ini paramter : registrarMethod tidak anda sertakan, silakan di cek kembali');
        }
        if ( !isNull(props.variableName) && ! isNull(props.registerVariableMethod)) {
            props.registerVariableMethod!( props.variableName !,  this);
        }
    }

    focusToControl: () => any = () => {
        focusToDiv(this.rootElementId); 
    }
    runMandatoryValidation (): CustomValidationFailureResult {
         return this.runMandatoryValidationWorker() ; 
    }

    generateDefaultState (): EditorSelectFxState {
        return {
            expanded: false,
            selectedData: null!,
            mandatoryValidationFailed : false , 
            data : null!
        };
    }
    componentWillUnmount () {
        if ( !isNull(this.props.registrarMethod)) {
            this.props.registrarMethod(this , true ); 
        }
        if ( !isNull(this.props.variableName) && ! isNull(this.props.registerVariableMethod)) {
            this.props.registerVariableMethod!( this.props.variableName! ,  null);
        }
    }

    assignDataToControl (data: any , updateState ?: boolean ) {
        let val: any  =  isNull(this.props.customFetchValueFromData) ?   readNested(data , this.props.fieldName) : this.props.customFetchValueFromData!(data)  ; 
        if ( !isNull(updateState) || !updateState ) {
            this.setValueNoWorker(val , this.state) ; 
        } else {
            this.setStateHelper (st => this.setValueNoWorker( val ,  st) );
        }
         
    }

    fetchDataFromControl(data: any ) {
        let val: string = this.getValue() ; 
        if ( isNull(this.props.customAssignValueToData)) {
            setValueHelper(data , this.props.fieldName , val ) ; 
        } else {
            this.props.customAssignValueToData!(data , val); 
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
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }

    render (): JSX.Element {
        if ( this.props.readonlyState) {
            let lbl: string = "" ; 
            if ( !isNull(this.state.selectedData)) {
                lbl = this.readonlyLabelFormatter(this.state.selectedData!);
            }
            return <span key={'readonly_panel' + this.rootId} id={this.rootElementId} className={this.readonlyCssName}>{lbl}</span>; 
        } else {
            // let actContent: any[] = [];
            if (!isNull(this.props.required) && this.props.required && this.state.mandatoryValidationFailed) {
                return this.rendererTaskCombo( { mandatoryValidationFailed : true , errorMessage :  this.props.mandatoryValidationFailedMessage}  );
                        
            }  else {
                return  this.rendererTaskCombo({}); 
            }  
        }
    }
}