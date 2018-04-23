
import * as React from 'react';
import { isNull  } from '../../../utils/index';
import { JqGridButtonProps } from './GridPanelComponent';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from '../../BaseHtmlComponent';

/**
 * 
 */
export interface JqGridButtonPanelProps<DATA> extends BaseHtmlComponentProps {
    button: JqGridButtonProps<DATA> ;
    data: DATA  ; 
    rowIndex: number ;  
    /**
     * requestor grid state
     * @param rowIndex index dari data dalam row
     */
    requestGridStateData: ( rowIndex: number ) => any ;
    /**
     * method untuk memaksa grid state update
     */
    applyGridState: () => any ; 
}
export interface JqGridButtonPanelState<DATA> extends BaseHtmlComponentState {
    hovered: boolean ;
    dummyVar ?: DATA ; 
}
/**
 * single button renderer. untuk button dalam grid
 */
export class JqGridButtonPanel<DATA> extends BaseHtmlComponent<JqGridButtonPanelProps<DATA> , JqGridButtonPanelState<DATA> > {

    constructor(props: JqGridButtonPanelProps<DATA>) {
        super(props) ; 
        this.state = {hovered: false} ; 
    }

    render (): JSX.Element {
        if (  !isNull(this.props.button.doNotRenderIf) && this.props.button.doNotRenderIf || 
            (!isNull(this.props.button.originalButtonProps) && !isNull(this.props.button.originalButtonProps!.doNotRenderIf) && this.props.button.originalButtonProps!.doNotRenderIf) 
            
        ) {
            return <input type='hidden' />;
        }
        let dispStyle: React.CSSProperties = {float: 'left', cursor: 'pointer'} ; 
        if ( !isNull(this.props.button.hidden) && this.props.button.hidden) {
            dispStyle.display = 'none';
        }
        let iconCss: string = this.props.button.buttonCss! ; 
        let iconStyle: React.CSSProperties = {
            cursor : 'pointer'
        };
        if ( this.state.hovered  ) {
            iconStyle.fontWeight  =  'bold'  ; 
            iconStyle.color = 'red';
            if  ( !isNull(this.props.button.buttonCssOnMouseEnter)) {
                iconCss = this.props.button.buttonCssOnMouseEnter! ; 
            }
            
        }

        return (
        <div 
            title={this.props.button.buttonTitle} 
            style={dispStyle} 
            className="ui-pg-div ui-inline-edit"  
            onClick={() => {
                this.props.button.clickHandler(this.props.data , this.props.rowIndex);
                if ( !isNull(this.props.button.clickHandlerExtended) ) {
                    this.props.button.clickHandlerExtended!({
                        data: this.props.data , 
                        rowIndex: this.props.rowIndex , 
                        rowState: this.props.requestGridStateData(this.props.rowIndex) , 
                        updateGridState: this.props.applyGridState
                    });
                }
            }} 
            onMouseEnter={(evt: React.MouseEvent<any>) => {
                if ( !this.state.hovered) {
                    this.setStateHelper ( st =>  st.hovered = true );
                }
                evt.stopPropagation(); 
                
            }} 
            onMouseOut={(evt: React.MouseEvent<any>) => {
                if ( this.state.hovered) {
                    this.setStateHelper ( st =>  st.hovered = false );
                }
                evt.stopPropagation(); 
            }} 
        ><span className={iconCss} style={iconStyle}>{}</span>
        </div>
        );
    }
    
}