
import * as React from "react" ;
import { GridButtonProps } from './SimpleGridMetadata';
import { isNull, BaseComponent , BaseComponentProps , BaseComponentState } from 'core-client-commons/index';

export interface GridActionButtonLinkIconProps<DATA> extends GridButtonProps<DATA>  ,  BaseComponentProps {
    data: DATA ; 
    keySuffix: string ;

}
export interface GridActionButtonLinkIconState  extends BaseComponentState {
    hovered: boolean ; 
}

export class GridActionButtonLinkIcon<DATA>  extends  BaseComponent < GridActionButtonLinkIconProps<DATA>, GridActionButtonLinkIconState> {
    constructor(props: GridActionButtonLinkIconProps<DATA>) {
        super(props) ; 
        this.state  = {
            hovered : false 
        };
    }

    render (): JSX.Element {
        let dispStyle: React.CSSProperties = {};
        if ( !isNull(this.props.hidden) && this.props.hidden) {
            dispStyle.display = 'none';
        }
        let cssName: string = this.props.iconCssClass;
        if (!isNull(this.props.iconCssClassProvider)) {
            cssName = this.props.iconCssClassProvider!(this.props.data); 
        }
        if ( this.state.hovered) {
            if ( !isNull(this.props.iconCssMouseEnter)) {
                cssName = this.props.iconCssMouseEnter! ; 
            }
        }
       
        return (
        <a
            key={'link_button_' + this.props.keySuffix}
            onClick={() => {
                if ( !isNull(this.props.clickHandler)) {
                    this.props.clickHandler(this.props.data); 
                }
            }}
            onMouseLeave={() => {
                this.setStateHelper( st => st.hovered = false  ) ; 
            }}
            onMouseEnter={() => this.setStateHelper( st => {  st.hovered = true ; })}
            href='javascript:doNothing()'
            data-tooltip-placement='top'
            data-tooltip={this.props.label} 
            title={this.props.label}
            className='btn btn-transparent btn-xs tooltips'
            style={dispStyle}
        >
                <i className={cssName}/>
        </a>
        );
    }

}