import * as React from "react" ;
import {  getCssForColumnWithScreenType } from '../../../utils/index';
import {  isNull ,  EditorInputElement } from 'core-client-commons/index' ;
import { EditorDateTextboxProps , EditorDateTextbox , CalendarIcon } from './EditorDateTextbox';
import { BaseHtmlComponent , BaseHtmlComponentState } from '../../BaseHtmlComponent';

export interface EditorDateTextboxLabeledState extends BaseHtmlComponentState {

    /**
     * flag control sudah di register atau belum, ini karena tukar2 control tergister berkali-kali
     */
    controlRegistered: boolean ; 

}

export interface EditorDateTextboxLabeledProps extends EditorDateTextboxProps {
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
    hidden ?: boolean ; 
    /**
     * flag kalau control perlu di remove
     */
    doNotRenderIf  ?: boolean ; 
}
/**
 * component date picker + label
 */
export class EditorDateTextboxLabeled extends BaseHtmlComponent<EditorDateTextboxLabeledProps , EditorDateTextboxLabeledState > implements EditorInputElement {
    /**
     * midle class dari bootstrap
     */
    bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
    elementId: string ; 
    labelCss: string ; 
    divCss: string  ; 
    datePicker: EditorDateTextbox ; 
    constructor(props: EditorDateTextboxLabeledProps) {
        super(props ); 
        this.bootstrapColumnClass  = getCssForColumnWithScreenType() ; 
        this.labelCss = 'col-' + this.bootstrapColumnClass + '-4 control-label ' ; 
        this.divCss = 'col-' + this.bootstrapColumnClass + '-4'; 
        this.state = {
            controlRegistered : false 
        } ; 
        this.elementId = props.id || null! ;
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorDateTextbox.ID_COUNTER === -1) {
                EditorDateTextbox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_date_txt_' + EditorDateTextbox.ID_COUNTER ;
            EditorDateTextbox.ID_COUNTER += 1  ;
        }
        if ( props.cssLabel != null && typeof props.cssLabel !== 'undefined') {
            this.labelCss = props.cssLabel;
        }
        if ( props.cssDivTextbox != null && typeof props.cssDivTextbox !== 'undefined') {
            this.divCss = props.cssDivTextbox;
        }
    }
    /**
     * assign data ke control
     */
    assignDataToControl  (data: any )  {
        //
    } 
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        //
    }
    /**
     * helper utnuk register component ke parent
     * @param control 
     * @param unReg 
     */
    registerControl: ( control: any , unReg: boolean  ) => void =   ( control: any , unReg: boolean  ) =>  {
        if (  isNull(this.props.registrarMethod) ) {
            return ; 
        }
        this.setStateHelper ( 
            st => {
                if (  isNull(unReg) || !unReg ) {
                    if ( st.controlRegistered) {
                        return ; 
                    }
                    this.props.registrarMethod( control , false ) ;
                    st.controlRegistered = true ; 
                } else {
                    this.props.registrarMethod( control , true ) ;
                    st.controlRegistered = true ; 
                }
            });
    }
    
    render () {
        if ( !isNull(this.props.doNotRenderIf) && this.props.doNotRenderIf) {
            return <input type='hidden' />;
        }
        return (
            <div className="form-group" style={{display: this.props.hidden ? 'none' : ''}}>
                <label className={this.labelCss} htmlFor={this.elementId}><strong>{this.props.label}</strong></label>
                <div   className={this.divCss} style={{textAlign: 'left'}}>
                    <div  key={'editable_text_date_' + this.elementId} className="input-group" >
                        <EditorDateTextbox
                            fieldName={this.props.fieldName}
                            className={this.props.className}
                            title={this.props.title}
                            tabIndex={this.props.tabIndex}
                            readonlyCssName={this.props.readonlyCssName}
                            customAssignValueToData={this.props.customAssignValueToData}
                            customFetchValueFromData={this.props.customFetchValueFromData}
                            variableName='datePicker'
                            readonlyState={this.props.readonlyState}
                            registrarMethod={this.registerControl}
                            changeHandler={this.changeHandler} 
                            invokeSubmitOnEnter={this.props.invokeSubmitOnEnter}
                            startDate={this.props.startDate}
                            required={this.props.required}
                            endDate={this.props.endDate}
                            datesDisabled={this.props.datesDisabled}
                            dateformat={this.props.dateformat}
                            id={this.elementId}
                        />
                        {isNull( this.props.readonlyState) || !(!!this.props.readonlyState) ? <CalendarIcon clickHandler={this.calendarIconClickHandler}/> : null}
                        </div>
                    </div>
                </div>
        );
    }

    private calendarIconClickHandler: () => any = () => {
        if ( !isNull(this.props.readonlyState) && this.props.readonlyState  || isNull(this.datePicker)) {
            return ; 
        }
        this.datePicker.show();
    }
    private changeHandler: (dt: Date) => void = (dt: Date) => {
        if ( this.props.changeHandler != null && typeof this.props.changeHandler !== 'undefined') {
            this.props.changeHandler(dt);
        }
    }
}