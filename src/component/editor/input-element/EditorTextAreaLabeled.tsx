import * as React from 'react' ; 
import { EditorTextAreaProps, EditorTextArea } from "./EditorTextArea";
import { BaseHtmlComponent } from "../../BaseHtmlComponent";
import { LabelOnlyEditorControl } from "./LabelOnlyEditorControl";

export interface EditorTextAreaLabeledProps extends EditorTextAreaProps {
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
}
export interface EditorTextAreaLabeledState  {
    
    elementId: string; 
}

export class EditorTextAreaLabeled extends BaseHtmlComponent<EditorTextAreaLabeledProps, EditorTextAreaLabeledState> {
    constructor(props: EditorTextAreaLabeledProps) {
        super(props) ; 
        this.state = {
            elementId: 'automatic_element_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 1000)
        };
        
    }

    render() {
        let id: string = this.state.elementId;
        if (this.props.id) {
            id = this.props.id; 
        }
        
        return (
        <LabelOnlyEditorControl
            label={this.props.label}
            className={this.props.className}
            cssDivTextbox={this.props.cssDivTextbox}
            cssLabel={this.props.cssLabel}
            hidden={this.props.hidden}
            title={this.props.title}
            htmlFor={id}
            value=''
        >
            <EditorTextArea 
                required={this.props.required}
                changeHandler={this.props.changeHandler}
                doNotUpdateEditorStateOnChange={this.props.doNotUpdateEditorStateOnChange}
                className={this.props.className}
                cols={this.props.cols}
                fieldName={this.props.fieldName}
                id={id}
                onLostFocusAndValueChange={this.props.onLostFocusAndValueChange}
                onBlur={this.props.onBlur}
                readonlyState={this.props.readonlyState}
                registrarMethod={this.props.registrarMethod}
                rows={this.props.rows}
                tabIndex={this.props.tabIndex}
                title={this.props.title}
                lengthExceedMessageGenerator={this.props.lengthExceedMessageGenerator}
                maxLength={this.props.maxLength}
            />
        </LabelOnlyEditorControl>
    );
    }
}