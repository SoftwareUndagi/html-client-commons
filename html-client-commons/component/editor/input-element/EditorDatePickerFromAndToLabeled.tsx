import * as React from "react" ;
import { getCssForColumnWithScreenType  } from '../../../utils/index';
import { isNull   } from 'core-client-commons/index' ;
import { EditorDatePickerFromAndTo , EditorDatePickerFromAndToProps } from './EditorDatePickerFromAndTo'; 
import { EditorDateTextbox } from './EditorDateTextbox';
import { BaseHtmlComponent  } from '../../BaseHtmlComponent';

/**
 * props untuk date from to untuk 
 */
export interface EditorDatePickerFromAndToLabeledProps extends EditorDatePickerFromAndToProps {
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
    cssDivTextbox  ?: string  ; 
}

/**
 * date from + to dengan label 
 */
export class EditorDatePickerFromAndToLabeled extends BaseHtmlComponent<EditorDatePickerFromAndToLabeledProps , any > {
    /**
     * css untuk label. di default:col-xx-4 control-label
     */
    cssLabel: string ; 

    /**
     * css untuk div container textbox
     */
    cssDivTextbox: string ;

    /**
     * id dari element. di pergunakan untuk for
     */
    elementId: string ; 
    /**
     * midle class dari bootstrap
     */
    bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
    constructor(props: EditorDatePickerFromAndToLabeledProps) {
        super(props) ; 
        this.bootstrapColumnClass   = getCssForColumnWithScreenType() ;
        this.cssLabel = 'col-' + this.bootstrapColumnClass + '-4 control-label'; 
        this.cssDivTextbox = 'col-' + this.bootstrapColumnClass + '-8' ; 
        if ( props.cssLabel != null  && typeof props.cssLabel !== 'undefined') {
            this.cssLabel = props.cssLabel ;
        }
        if ( props.cssDivTextbox != null && props.cssDivTextbox !== '') {
            this.cssDivTextbox = props.cssDivTextbox ; 
        }
        this.elementId = props.id || null! ;
        if (this.elementId == null || typeof this.elementId === 'undefined' ) {
            if ( EditorDateTextbox.ID_COUNTER === -1) {
                EditorDateTextbox.ID_COUNTER = new Date().getTime() ;
            }
            this.elementId = 'core_framework_date_txt_' + EditorDateTextbox.ID_COUNTER ;
            EditorDateTextbox.ID_COUNTER += 1  ;
        }
    }

    render() {
        return ( 
        <div className="form-group">
            <label 
                className={this.cssLabel} 
                htmlFor={this.elementId}
            ><strong>{this.props.label}</strong>
            </label>
            <div className={this.cssDivTextbox}>
                <EditorDatePickerFromAndTo
                    fieldNameFrom={this.props.fieldNameFrom}
                    fieldNameTo={this.props.fieldNameTo}
                    className={this.props.className}
                    titleFrom={this.props.titleFrom}
                    titleTo={this.props.titleTo}
                    tabIndex={this.props.tabIndex}
                    readonlyState={this.props.readonlyState}
                    registrarMethod={this.props.registrarMethod}
                    changeHandlerFrom={this.props.changeHandlerFrom}
                    changeHandlerTo={this.props.changeHandlerTo}
                    id={this.elementId}
                    fromStartDate={this.props.fromStartDate}
                    fromEndDate={this.props.fromEndDate}
                    fromDatesDisabled={this.props.fromDatesDisabled}
                    toStartDate={this.props.toStartDate}
                    toEndDate={this.props.toEndDate}
                    toDatesDisabled={this.props.toDatesDisabled}
                    dateformat={this.props.dateformat}
                    fromDateRequired={this.props.fromDateRequired}
                    toDateRequired={this.props.toDateRequired}
                    dateFromCustomHandler={this.props.dateFromCustomHandler}
                    dateToCustomHandler={this.props.dateToCustomHandler}
                    businessFieldName={isNull(this.props.businessFieldName) ? this.props.label : this.props.businessFieldName}
                    customValidator={this.props.customValidator}
                />
            </div>
        </div>
        ); 
    }

}