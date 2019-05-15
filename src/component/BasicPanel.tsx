import * as React from "react" ;
import { BaseHtmlComponent } from "./BaseHtmlComponent";

export interface CDivProps extends React.Props<CDiv> {

    /**
     * flag render atau tidak
     */
    doNotRender ?: boolean ; 

    /**
     * css class dari control
     */
    className?: string; 

    /**
     * click panel handler
     */
    onClick?: React.MouseEventHandler<any>;
}

export class CDiv extends BaseHtmlComponent<CDivProps , any > {
    constructor(props: CDivProps) {
        super(props) ; 
        this.state = {};
    }

    render () {
        if ( this.props.doNotRender != null && typeof this.props.doNotRender !== 'undefined'  && this.props.doNotRender) {
            return <input type='hidden' />;
        }
        return (
            <div
                onClick={this.props.onClick}
                className={this.props.className}
            >{this.props.children}
            </div>
        );
    }

}