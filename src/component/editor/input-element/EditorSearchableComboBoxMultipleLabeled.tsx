import * as React from 'react' ; 
import { BaseEditorSearchableComboBoxMultiple , BaseEditorSearchableComboBoxMultipleProps , BaseEditorSearchableComboBoxMultipleState } from './EditorSearchableComboBoxMultiple' ; 
import { LabelOnlyEditorControl } from './LabelOnlyEditorControl' ; 

export interface EditorSearchableComboBoxMultipleLabeledProps extends BaseEditorSearchableComboBoxMultipleProps {
    /**
     * nama class yang di pakai textbox
     */
    className?: string ;

    /**
     * title untuk hint dalam textbox
     */
    title?: string ;
    
    /**
     * label untuk di sebelah textbox
     */
    label: string;

    /**
     * for utnuk element
     */
    htmlFor?: string; 
    /**
     * css untuk label. di default:col-xx-4 control-label 
     */
    cssLabel?: string ; 

    /**
     * css untuk div textbox. kalau misal di perlukan item tertentu untuk bagian ini 
     */
    cssDivTextbox  ?: string ;

    /**
     * css untuk span readonly
     */
    spanReadonlyCssName ?: string ; 
    /**
     * flag di hidden atau tidak
     */
    hidden?: boolean ; 

    /**
     * untuk tidak merender data dengan conditional
     */
    doNotRenderIf  ?: boolean ; 
} 
export interface EditorSearchableComboBoxMultipleLabeledState extends BaseEditorSearchableComboBoxMultipleState {} 
/**
 * control editor dengan multiple selection
 */
export class EditorSearchableComboBoxMultipleLabeled extends BaseEditorSearchableComboBoxMultiple< EditorSearchableComboBoxMultipleLabeledProps, EditorSearchableComboBoxMultipleLabeledState > {
    generateDefaultState(): EditorSearchableComboBoxMultipleLabeledState {
        return {
            dropDownShowed: 'none',
            valueHaveSetted: false,
            valueLookups: {},
            values: [],
            versioner: 1
        };
    }

    render(): JSX.Element {
        return (
        <LabelOnlyEditorControl 
            label={this.props.label}
            className={this.props.className}
            title={this.props.title}
            htmlFor={this.props.htmlFor}
            cssLabel={this.props.cssLabel}
            cssDivTextbox={this.props.cssDivTextbox}
            spanReadonlyCssName={this.props.spanReadonlyCssName}
            hidden={this.props.hidden}
            doNotRenderIf={this.props.doNotRenderIf}
            value={''}
        >{this.renderNormalSelector()}
        </LabelOnlyEditorControl>
        );
    }

}