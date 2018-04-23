
import * as React from "react" ;
import { LabelOnlyEditorControl } from './LabelOnlyEditorControl';
import { isNull, readNested, setValueHelper , getCssForColumnWithScreenType  } from '../../../utils/index';
import { SwitcheryWrapperDumb } from './SwitcheryWrapperDumb';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';

export interface EditorSwitcheryControlLabeledState extends BaseHtmlComponentState {
    value: boolean ; 
}
export interface EditorSwitcheryControlLabeledProps extends BaseHtmlComponentProps {
    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (combo: any , unregFlag ?: boolean ) => any ; 

    /**
     * nama field
     */
    fieldName: string ;

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
     * value change handler
     */
    changeHandler?: ( value: string ) => any ; 

    /**
     * readonly state dari control
     */
    readonlyState: boolean ; 

    /**
     * state default. checked atau tidak
     */
    defaultChecked?: boolean ; 

    /**
     * id dari element untuk checkbox
     */
    elementId?: string ;

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
    customAssignValueToData?: (targetData: any, value: string ) => any;

}

/**
 * control dengan label
 */
export class EditorSwitcheryControlLabeled extends BaseHtmlComponent<EditorSwitcheryControlLabeledProps , EditorSwitcheryControlLabeledState> {
    /**
     * field-field pada props yang akan di compare
     */
    static COMPARED_PROP_FIELDS: string [] = ['readonlyState' , 'hidden' , 'cssLabel', 'label']; 

    /**
     * field pada state yang di compare
     */
    static COMPARED_STATE_FIELDS: string [] = ['value']; 

    cssLabel: string;
    cssDivTextbox: string ;

    /**
     * pengecek sudah rendered atau tidak. ini untuk menhindari bug : Can only update a mounted or mounting component. This usually means you called setState() on an unmounted component.
     * memflag mounted element saja untuk di set state
     */
    checkerLabel: any ; 
    // switcheryControl: SwitcheryWrapper ; 
    constructor(props: EditorSwitcheryControlLabeledProps) {
        super(props) ; 
        let bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
        this.cssLabel = 'col-' + bootstrapColumnClass + '-4 control-label';
        this.cssDivTextbox = 'col-' + bootstrapColumnClass + '-8';
        this.state = {
            value: true 
        };
        props.registrarMethod(this ); 
        if (props.variableName && props.registerVariableMethod) {
            props.registerVariableMethod(props.variableName , this);
        }
        if ( props.cssLabel != null && typeof props.cssLabel !== 'undefined' && props.cssLabel !== '' ) {
            this.cssLabel = props.cssLabel ; 
        }
        if ( props.cssDivTextbox != null && typeof props.cssDivTextbox !== 'undefined' && props.cssDivTextbox !== '' ) {
            this.cssDivTextbox = props.cssDivTextbox ; 
        }  
    }

    /**
     * assign value untuk control. checked atau bukan
     * @param value checked value
     */
    assignCheckedFlag ( value: boolean ) {
        if ( this.state.value === value) {
            return  ; 
        }
        this.setStateHelper( st => st.value = value ); 
    }
    componentWillUnMount () {
        this.props.registrarMethod(this , true); 
        if ( this.props.variableName && this.props.registerVariableMethod) {
            this.props.registerVariableMethod(this.props.variableName , null);
        }
    }

    shouldComponentUpdate(nextProps: EditorSwitcheryControlLabeledProps , nextState: EditorSwitcheryControlLabeledState) {
        for ( let k of  EditorSwitcheryControlLabeled.COMPARED_PROP_FIELDS) {
            if ( nextProps[k] !== this.props[k]) {
                return true ; 
            }
        }
        for ( let k of  EditorSwitcheryControlLabeled.COMPARED_STATE_FIELDS) {
            if ( nextState[k] !== this.state[k]) {
                return true ; 
            }
        }
        return false ; 
    }
    assignDataToControl (data: any ) {
        
        if ( isNull(this.props.fieldName) || this.props.fieldName.length === 0 ) {
            return ; 
        }
        let val: any =  !this.props.customFetchValueFromData ?   readNested(data , this.props.fieldName) : this.props.customFetchValueFromData(data) ; // readNested(data ,this.props.fieldName) ;
        if ( isNull(val)) {
            val = 'N'; 
        }
        if ( !isNull(this.checkerLabel )) {
            this.setStateHelper ( salin => salin.value =  val === 'Y' || val === 'y'  ); 
        } else {
            this.setStateHelper  ( st => st.value = (val === 'Y' || val === 'y') );
        }
    }

    fetchDataFromControl (data: any) {
        let strVal: string = this.state.value ? 'Y' : 'N';
        if ( isNull(this.props.fieldName) || this.props.fieldName.length === 0 ) {
            return ; 
        }
        if ( !this.props.customAssignValueToData) {
            setValueHelper(data , this.props.fieldName , strVal ) ; 
        } else {
            this.props.customAssignValueToData(data , strVal); 
        }
    }
    render () {
        if ( !isNull(this.props.hidden) && this.props.hidden) {
            return <input type='hidden' key='place_holder_EditorSwitcheryControlLabeled' id={'placeholder_EditorSwitcheryControlLabeled_' + (new Date()).getTime()} />; 
        }
        let defChk: boolean = false ; 
        if ( !isNull(this.state.value)) {
            defChk = this.state.value ; 
        } else if ( this.props.defaultChecked) {
            defChk =  this.props.defaultChecked ; 
        }
        return (
        <LabelOnlyEditorControl
            value=''
            cssLabel={this.cssLabel}
            cssDivTextbox={this.cssDivTextbox}
            label={this.props.label}
            ref={d => {
                this.checkerLabel = d !; 
            }}
        >       
            <SwitcheryWrapperDumb 
                checked={defChk}
                readonlyState={isNull(this.props.readonlyState) ? false : this.props.readonlyState}
                toggleCheck={this.toggleCheck}
            />
        </LabelOnlyEditorControl>
        );
    }

    private toggleCheck: () => void = () => {
        this.setStateHelper( 
            salin => {
                if ( isNull(salin.value)) {
                    salin.value = true  ;
                }
                salin.value = !salin.value; 
            } , 
            () => {
                if ( this.props.changeHandler) {
                    this.props.changeHandler(this.state.value ? 'Y' : 'N'); 
                }
            });
    }

}