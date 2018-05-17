import * as React from 'react';
import {  isNull } from '../../../utils/index';
import { JqGridButtonProps  } from './GridPanelComponent';
import { BaseHtmlComponent } from '../../BaseHtmlComponent';

/**
 * state untuk button footer
 */
export interface JqGridFooterButtonState {}
export interface JqGridFooterButtonProps<DATA>  {
    buttonProp:  JqGridButtonProps<DATA> ; 
    index: number ; 

    /**
     * id dari grid. untuk prefix button id 
     */
    gridId: string ; 

    /**
     * item data selected
     */
    selectedData: DATA ;

    selectedRowindex: number ; 
}

/**
 * untuk footer button
 */
export class JqGridFooterButton<DATA> extends BaseHtmlComponent<JqGridFooterButtonProps<DATA> , JqGridFooterButtonState> {
    constructor(props: JqGridFooterButtonProps<DATA>) {
        super(props); 
        this.state = {} ; 
    }
     
    /**
     * single button renderer. di pisah agar variable menjadi localized
     */
    render(): JSX.Element {
        let buttonDef: JqGridButtonProps<DATA> = this.props.buttonProp ; 
        
        let buttonIndex: number = this.props.index ; 
        let id: string = this.props.gridId + "_footer_button_" + buttonIndex;
        if (  isNull(buttonDef.renderButtonOnColumnFlag) || (!isNull(buttonDef.renderButtonOnColumnFlag) && buttonDef.renderButtonOnColumnFlag) ) {
            return <td id={id + '_only_on_column'} key={id + '_only_on_column'} style={{ display: 'none' }}>{}</td>;
        }
        if (isNull(buttonDef.showOnlyOnItemSelected) || buttonDef.showOnlyOnItemSelected  ) {
            if (isNull(this.props.selectedData)) {
                return <td id={id} key={id} style={{ display: 'none' }}>{}</td>;
            }
        }
        let style: React.CSSProperties = {} ; 
        if ( !isNull(this.props.buttonProp.hidden) && this.props.buttonProp.hidden) {
            style.display = 'none';
        }
        if (!isNull(buttonDef.originalButtonProps)) {
            if ( (!isNull(buttonDef.originalButtonProps!.hidden) && buttonDef.originalButtonProps!.hidden ) ) {
                style.display = 'none'; 
            } else if  (!isNull(buttonDef.originalButtonProps!.doNotRenderIf) && buttonDef.originalButtonProps!.doNotRenderIf ) {
                let idOrKey: string = 'button_footer_donot_renderif_value_' + new Date().getTime(); 
                return <td style={{display: 'none'}}  key={idOrKey} id={idOrKey}>{}</td>;
            } else if (!isNull(buttonDef.originalButtonProps!.doNotRenderIfCustomEvaluator) ) {
                if ( buttonDef.originalButtonProps!.doNotRenderIfCustomEvaluator!(null!)) {
                    let idOrKey: string = 'button_footer_donot_renderif_method_' + new Date().getTime(); 
                    return <td style={{display: 'none'}} key={idOrKey} id={idOrKey}>{}</td>;
                }
            }
        }
        
        return (
        <td 
            style={style}
            className="ui-pg-button ui-corner-all"
            onMouseEnter={() => {
                let elem: HTMLElement = document.getElementById(id)!;
                let clsName: string = elem.className;
                if (clsName.indexOf('ui-state-hover') < 0) {
                    clsName += ' ui-state-hover';
                }
                elem.className = clsName;
            } }
            onMouseLeave={() => {
                let elem: HTMLElement = document.getElementById(id)!;
                let clsName: string = elem.className;
                if (clsName.indexOf('ui-state-hover') >= 0) {
                    clsName = clsName.split('ui-state-hover').join(' ');
                }
                elem.className = clsName;
            } }
            title={this.props.buttonProp.buttonTitle}
            id={id}
            key={id}
        >
            <div 
                className="ui-pg-div"
                onClick={() => {
                    buttonDef.clickHandler(this.props.selectedData, this.props.selectedRowindex);
                } }
            >
                <span className={buttonDef.buttonCss}>{}</span>{this.props.buttonProp.label}
            </div>
        </td>);
    }
}