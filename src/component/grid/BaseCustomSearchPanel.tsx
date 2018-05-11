import { CommonCommunicationData , ListOfValueManager   } from 'core-client-commons';
import { BaseHtmlComponent } from "../BaseHtmlComponent";
export interface BaseCustomSearchPanelProps {

    /**
     * nama field untuk search
     */
    fieldName: string ; 
    /**
     * ini <strong>tidak</strong> perlu di set, akan di set oleh grid nanti pada saat render
     * lookup manager untuk request lookup
     */
    lookupManager ?: ListOfValueManager ; 

    /**
     * ini <strong>tidak</strong> perlu di set, akan di set oleh grid nanti pada saat render
     * worker untuk assign query.query berada pada header
     */
    assignQueryHandler ?: (field: string, whereValue: any) => any ; 

    /**
     * ini <strong>tidak</strong> perlu di set, akan di set oleh grid nanti pada saat render
     * assign query.query ada pada model
     */
    assignQueryOnIncludeModel ?: (modelName: string, fieldName: string, whereValue: any, useInnerJoin: boolean, modelAs?: string) => any ; 
    /**
     * ini <strong>tidak</strong> perlu di set, akan di set oleh grid nanti pada saat render
     * container data lookup
     */
    lookupContainer ?: {[id: string]: CommonCommunicationData.CommonLookupValue[] };

    /**
     * ini <strong>tidak</strong> perlu di set, akan di set oleh grid nanti pada saat render
     * tipe grid yang perlu di render. normal atau scrollable panel
     */
    gridType: 'simple' |'scrollable' ; 
}
export interface BaseCustomSearchPanelState {
    
} 
/**
 * base panel untuk custom search panel . ini di taruh di bagian header dari grid untuk panel search 
 */
export abstract class BaseCustomSearchPanel<PROPS extends BaseCustomSearchPanelProps, STATE extends BaseCustomSearchPanelState> extends BaseHtmlComponent<PROPS  , STATE > {
    /**
     * lookup manager
     */
    lookupManager: ListOfValueManager ; 
    /**
     * flag component sudah di load atau tidak
     */
    componentMounted: boolean  = false; 
    /**
     * flag search parameter sudah di assign atau belum
     */
    searchParameterAssigned: boolean = false; 

    constructor(props: PROPS) {
        super(props) ; 
        this.state = this.generateDefaultState();
    }
    /**
     * generator state
     */
    abstract generateDefaultState (): STATE ; 
    render () {
        return this.renderSearchPanel() ;
    }
    abstract renderSearchPanel  (): JSX.Element ; 

}