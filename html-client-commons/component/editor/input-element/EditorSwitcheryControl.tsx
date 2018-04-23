
import * as React from "react" ;
import { EditorInputElement } from './CommonsInputElement';
import {  isNull, readNested, setValueHelper } from '../../../utils/index';
import { BaseHtmlComponent   } from '../../BaseHtmlComponent';
import { SwitcheryWrapper } from './SwitcheryWrapper' ; 

export interface EditorSwitcheryControlProps  {

    /**
     * flag universal untuk mem-bind value ke control dalam proses on change. kalau variable = true maka onChange akan mengupdate data dalam state
     */
    bindValueToFormOnChange ?: boolean ;

    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (textbox: EditorSwitcheryControl , unregFlag ?: boolean ) => any ; 

    /**
     * nama field
     */
    fieldName: string ;
    /**
     * value change handler
     */
    changeHandler ?: ( value: string ) => any ; 

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
    customAssignValueToData?: (targetData: any, value: string|number ) => any;

}
export interface EditorSwitcheryControlState { } 

export class EditorSwitcheryControl  extends BaseHtmlComponent<EditorSwitcheryControlProps , EditorSwitcheryControlState > implements EditorInputElement {
    switcheryControl: SwitcheryWrapper ; 
    /**
     * method untuk force read data dari control
     */
    forceReadDataFromControlMethod:   (doNotUpdateState?: boolean) => any ;
    constructor(props: EditorSwitcheryControlProps) {
        super(props) ; 
        this.state = {} ;
        props.registrarMethod(this ); 
        if (  props.variableName  &&  props.registerVariableMethod) {
            props.registerVariableMethod(props.variableName , this);
        }
    }

    /**
     * assign method untuk force control readfromControl on change
     */
    assignForceReadDataFromControlMethod  ( method: (doNotUpdateState?: boolean) => any ): any {
        this.forceReadDataFromControlMethod = method ; 
    }
    componentWillUnMount () {
        if ( this.props.registrarMethod != null && typeof  this.props.registrarMethod !== 'undefined') {
            this.props.registrarMethod(this , true ); 
        } 
        if (this.props.variableName && this.props.registerVariableMethod) {
            this.props.registerVariableMethod(this.props.variableName , null);
        }
    }
    assignDataToControl (data: any , updateState ?: boolean ) {
        if ( isNull(this.props.fieldName) || this.props.fieldName.length === 0 ) {
            return ; 
        }
        let val: any =   !this.props.customFetchValueFromData ?   readNested(data , this.props.fieldName) : this.props.customFetchValueFromData(data) ; /// readNested(data ,this.props.fieldName) ;
        this.switcheryControl.value = val === 'Y' || val === 'y' ; 
        
    }

    fetchDataFromControl (data: any) {
        if ( isNull(this.props.fieldName) || this.props.fieldName.length === 0 ) {
            return ; 
        }

        let val: boolean = this.switcheryControl.value ; 
        let strVal: string = val ? 'Y' : 'N' ; 
        if ( !this.props.customAssignValueToData) {
            setValueHelper(data , this.props.fieldName , strVal ) ; 
        } else {
            this.props.customAssignValueToData(data , strVal); 
        }
    }

    changeHandler: ( value: boolean ) => void = ( value: boolean ) => {
        if ( this.props.changeHandler ) {
            this.props.changeHandler(value ? "Y" : "N") ;
        }
        if ( !isNull(this.props.bindValueToFormOnChange) && this.props.bindValueToFormOnChange && !isNull(this.forceReadDataFromControlMethod)) {
            try {
                this.forceReadDataFromControlMethod(); 
            } catch ( exc ) {
                console.error('[EditorSwitcheryControl] gagal update state data on change');
            }
        }
    }

    render () {
        return (
        <SwitcheryWrapper
            changeHandler={this.changeHandler}
            elementId={this.props.elementId}
            readonlyState={this.props.readonlyState}
            ref={d => this.switcheryControl = d!}
            defaultChecked={this.props.defaultChecked}
        />
        );
    }
}