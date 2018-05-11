import * as React from 'react';
import { BaseHtmlComponent } from './BaseHtmlComponent';
export interface PanelManagerContentWrapperProps {

    /**
     * flag hidden saat aktive
     */
    hiddenWhenNotActive: boolean ; 
}
export interface PanelManagerContentState  {

    activePanel: boolean ; 
}
/**
 * panel wrapper panel
 */
export class PanelManagerContentWrapper extends BaseHtmlComponent<PanelManagerContentWrapperProps , PanelManagerContentState > {
    constructor(props: PanelManagerContentWrapperProps) {
        super(props) ; 
        this.state = {
            activePanel : true
        } ;
    }
    /**
     * menandai item = latest
     * @param latestFlag 
     */
    markLatest ( latestFlag: boolean ) {
        if ( this.state.activePanel === latestFlag ) {
            return ; 
        }
        this.setStateHelper(  st => {
            st.activePanel = latestFlag ;
        });
    }

    render (): JSX.Element {
        let renderChild: boolean = false ;
        let invis: boolean = false ; 
        if ( this.state.activePanel ) {
            renderChild = true ; 
        } else if ( this.props.hiddenWhenNotActive) {
            renderChild = true  ; 
            invis = true ; 
        }
        return <span style={{display : (invis ? 'none' : '')}}>{renderChild ? this.props.children : <input type='hidden'/>}</span>; 
    }
}