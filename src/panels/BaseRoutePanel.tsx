import * as React from 'react';
import { RouteData } from '../component/RouteData';
import { isNull } from 'base-commons-module';
import { PanelManagerImpl, BaseHtmlComponent } from '../component/index';

export interface BaseRoutePanelProps {
    /**
     * data routing di kirimkan olleh main panel
     */
    routeData: RouteData ; 

}
export interface BaseRoutePanelState {
    panelManagerCount?: number ;
} 

/**
 * base class untuk route panel
 * @author <a href='gede.sutarsa@gmail.com'>Gede Sutarsa</a>
 */
export abstract class BaseRoutePanel<PROPS extends BaseRoutePanelProps, STATE extends BaseRoutePanelState > extends BaseHtmlComponent<PROPS , STATE> {
    constructor(props: PROPS) {
        super(props ) ; 
        let st: any = {
            panelManagerCount : 0 
        } ; 
        this.state = st ; 
    }
    /**
     * handler pada saat count pada panel manager change
     */
    onPanelCountChange: (count: number ) => any = (count: number ) => {
        this.setStateHelper( st => st.panelManagerCount = count  );
    }
    render (): JSX.Element {
        if ( isNull(this.props.routeData)) {
            return  <input type='hidden' />;  
        }
        let s: any =  this.generatePanel(this.props.routeData);
        if ( isNull(s)) {
            return <input type='hidden' />;
        }
        return (
        <span>  
                <span style={{display : (this.state.panelManagerCount > 0 ? 'none' : '') }}> {s}</span>
                <PanelManagerImpl key='panel_manager' onPanelCountChange={this.onPanelCountChange}/>
            </span>
            ) ; 
    }

    /**
     * generate panel handler untuk ini .kalau no route match ,sebaiknya return <input type='hidden'/>
     * @param routeData data routing
     */
    abstract generatePanel( routeData: RouteData  ): JSX.Element;
}