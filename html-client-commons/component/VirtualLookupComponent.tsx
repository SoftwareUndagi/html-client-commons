
import * as React from "react" ;
import { CommonCommunicationData, ListOfValueManager , LOVEnabledComponent   } from 'core-client-commons/index';
import { BaseHtmlComponent } from "./BaseHtmlComponent";

export interface VirtualLookupComponentProps {
    /**
     * id dari lookup. ini untuk di request kembali ke server
     */
    lovId: string; 

    /**
     * data lookup di taruh ke dalam state. di trigger pada saat element menerima data lookup
     */
    assignLookupData: (lookupId: string , lookupData: CommonCommunicationData.CommonLookupValue[] ) => any ; 

    /**
     * managaer lookup 
     */
    lookupManager: ListOfValueManager ; 

}

export interface VirtualLookupComponentState {
    lookupData?: CommonCommunicationData.CommonLookupValue[] ; 
}
/**
 * virtual lookup component. 
 */
export class VirtualLookupComponent extends BaseHtmlComponent<VirtualLookupComponentProps , VirtualLookupComponentState > implements LOVEnabledComponent {
    /**
     * id dari lookup. ini untuk di request kembali ke server
     */
    lovId: string;

    private elementId: string ; 
    constructor(props: VirtualLookupComponentProps) {
        super(props) ; 
        this.state = {}; 
        this.elementId = 'virtual_lookup_component_' + new Date().getTime();
        this.lovId = props.lovId; 
        props.lookupManager.register(this);
    }

    componentDidMount() {
        console.log('[VirtualLookupComponent] mounted : ' , this.props.lovId ); 
    }
    /**
     * underlying element. elemetn yang menjadi based dari LOV
     */
    getElement(): HTMLElement {
        return document.getElementById(this.elementId) !; 
    }

    /**
     * assign lookup header data
     */
    assignLookupData(lookupData: CommonCommunicationData.CommonLookupValue[]): any {
        if ( lookupData != null && typeof lookupData === 'undefined' ) {
            if (! Array.isArray(lookupData)) {
                return ; 
            }
        }
        if ( this.props.assignLookupData == null || typeof this.props.assignLookupData === 'undefined' ) {
            return ; 
        }
        this.props.assignLookupData(this.props.lovId ,  lookupData); 
    }

    render () {
        return (
            <input 
                type='hidden' 
                id={this.elementId} 
                value={this.state.lookupData == null || typeof this.state.lookupData === 'undefined' ? '' : JSON.stringify(this.state.lookupData)}
            />
        );
    }
    
}