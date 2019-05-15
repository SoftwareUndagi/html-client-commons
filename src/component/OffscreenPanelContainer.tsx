import * as React from "react";
import { BaseHtmlComponent } from "./BaseHtmlComponent";

export interface OffscreenPanelContainerProps {}
export interface OffscreenPanelContainerState {
    /**
     * panel drop down
     */
    panelContainers: JSX.Element[];
}
/**
 * worker untuk detach panel
 */
export interface DetachPanel {
    (): any; 
}

/**
 * container panel off screen. misal dialog
 */
export class OffscreenPanelContainer extends BaseHtmlComponent <OffscreenPanelContainerProps, OffscreenPanelContainerState> {
    /**
     * key untuk menaruh variable dalam session
     */
    static ON_WINDOW_VARIABLE_KEY: string = 'offscreen_panel_container'; 

    /**
     * ini untuk membaca offscreen panel container
     */
    static getOffscreenPanelContainer(): OffscreenPanelContainer  {
        let s: any = window[OffscreenPanelContainer.ON_WINDOW_VARIABLE_KEY];
        if (s == null || typeof s === 'undefined') {
            alert('Konfigurasi applikasi tidak beres. OffscreenPanelContainer belum siap. app wajib di bootstrap.silakan laporkan hal ini');
        }
        return s; 
    }
    constructor(props: OffscreenPanelContainerProps) {
        super(props);
        this.state = {
            panelContainers: []
        };
    }
    /**
     * append panel dari container
     * @param panel
     */
    appendPanel(panel: JSX.Element): DetachPanel {
        let s: any = null ; 
        if (this.state.panelContainers.indexOf(panel) > -1) {
            return s; 
        }
        
        this.setStateHelper (st => {
            st.panelContainers.push(panel);
        } );
        let rtvl: any = () => {
            console.log('[OffscreenPanelContainer]remove panel di panggil');
            this.setStateHelper (st => {
                let idx: number = st.panelContainers.indexOf(panel);
                if ( idx < 0) {
                    return ; 
                }
                st.panelContainers.splice(idx, 1);
            });
            
        };
        return rtvl; 
    }
    componentWillMount () {
        window[OffscreenPanelContainer.ON_WINDOW_VARIABLE_KEY] = this ; 
    }
   
    render(): JSX.Element {
        return (
        <span>
            {this.state.panelContainers}
        </span> 
        ); 

    }

}