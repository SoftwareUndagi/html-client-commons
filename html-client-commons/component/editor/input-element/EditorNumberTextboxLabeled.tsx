import * as React from "react" ;
import { isNull, getCssForColumnWithScreenType } from '../../../utils/index';
import { EditorNumberTextbox , EditorNumberTextboxProps  } from './EditorNumberTextbox';
import { BaseHtmlComponent } from "../../BaseHtmlComponent";

export interface EditorNumberTextboxLabeledProps extends EditorNumberTextboxProps {
    /**
     * label untuk di sebelah textbox
     */
    label: string ;

    /**
     * css untuk label. di default:col-xx-4 control-label 
     */
    cssLabel ?: string ; 

    /**
     * css untuk div textbox. kalau misal di perlukan item tertentu untuk bagian ini 
     */
    cssDivTextbox  ?: string ; 
    
    /**
     * hide textbox atau tidak
     */
    hidden ?: boolean ; 
}
export interface EditorNumberTextboxLabeledState {}
/**
 * ini untuk number textbox biasa
 */
export class EditorNumberTextboxLabeled extends BaseHtmlComponent<EditorNumberTextboxLabeledProps , any > {
    elementId: string ; 
    labelCss: string ;  
    divCss: string ;
    constructor(props: EditorNumberTextboxLabeledProps) {
        super(props); 
        let bootstrapColumnClass: string = getCssForColumnWithScreenType();  
        this.labelCss = 'col-' + bootstrapColumnClass + '-4 control-label';
        this.divCss = 'col-' + bootstrapColumnClass + '-4' ;  
        this.state = {} ; 
        this.elementId = props.id || null !;
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorNumberTextbox.ID_COUNTER === -1) {
                EditorNumberTextbox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_number_txt_' + EditorNumberTextbox.ID_COUNTER ;
            EditorNumberTextbox.ID_COUNTER += 1  ;
        }
        if ( props.cssLabel != null && typeof props.cssLabel !== 'undefined') {
            this.labelCss = props.cssLabel;
        }
        if ( props.cssDivTextbox != null && typeof props.cssDivTextbox !== 'undefined') {
            this.divCss = props.cssDivTextbox;
        }
    }

    render () {
        if ( !isNull(this.props.doNotRenderIf) && this.props.doNotRenderIf) {
            return <input type='hidden'/>;
        }
        return (
            <div className="form-group" style={{display : this.props.hidden ? 'none' : ''}} >
                <label className={this.labelCss} htmlFor={this.elementId}><strong>{this.props.label}</strong></label>
                <div   
                    className={this.divCss}
                    style={{textAlign: 'left'}}
                >
                    <EditorNumberTextbox 
                        bindValueToFormOnChange={this.props.bindValueToFormOnChange}
                        doNotUpdateEditorStateOnChange={this.props.doNotUpdateEditorStateOnChange}
                        changeHandler={this.props.changeHandler}
                        className={this.props.className}
                        fieldName={this.props.fieldName}
                        registrarMethod={this.props.registrarMethod}
                        min={this.props.min}
                        max={this.props.max}
                        readonlyState={this.props.readonlyState}
                        tabIndex={this.props.tabIndex}
                        id={this.elementId}
                        isMoney={this.props.isMoney}
                        title={this.props.title}
                        required={this.props.required}
                        variableName={this.props.variableName}
                        defaultValue={this.props.defaultValue}
                        customAssignValueToData={this.props.customAssignValueToData}
                        customFetchValueFromData={this.props.customFetchValueFromData}
                        registerVariableMethod={this.props.registerVariableMethod}
                    />{this.props.children}
                </div>
            </div>

        );
    }

}
