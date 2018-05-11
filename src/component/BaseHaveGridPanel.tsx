import { SimpleDbDrivenGrid } from './grid/SimpleDbDrivenGrid' ;
import { CommonCommunicationData , ListOfValueManager  } from 'core-client-commons' ;
import { ListOfValueComponent } from './ListOfValueComponent';
import { ajaxhelper  } from '../utils/index';
import { BaseHtmlComponent } from "./BaseHtmlComponent";

/**
 * base state untuk grid 
 */
export interface BaseHaveGridPanelState {
    /**
     * data lookup
     */
    lookups?: {[id: string]: CommonCommunicationData.CommonLookupValue[]}  ;
}
/**
 * base class untuk panel dengan grid. 
 * mohon di perhatikan dalam proses override componentDidMount, harap di panggil super method(super.componentDidMount()) agar perilaku component tetap consisten
 */
export abstract class BaseHaveGridPanel<DATA , PROPS, STATE extends BaseHaveGridPanelState> extends BaseHtmlComponent<PROPS, STATE> {
    /**
     * assign query worker 
     */
    assignQueryHandler: ( field: string , whereValue: any  ) => any ; 

    /**
     * ini untuk mengeset kalau misal query di pergunakan dalam include model. 
     */
    assignQueryOnIncludeModel: (modelName: string , fieldName: string ,  whereValue: any , useInnerJoin: boolean  , modelAs ?: string ) => any ;
    /**
     * lookup manager
     */
    lookupManager: ListOfValueManager ; 
    /**
     * handler untuk reload grid
     */
    reloadGrid: () => any ; 

    /**
     * untuk akses ke ajax
     */
    ajaxUtils: ajaxhelper.AjaxUtils ; 
    /**
     * default worker untuk assign loookup. ini akan otomatis menaruh data ke dalam state
     */
    assignLookupData:  (lookupId: string , lookupData: CommonCommunicationData.CommonLookupValue[] ) => any = (lookupId: string , lookupData: CommonCommunicationData.CommonLookupValue[] ) => {
        this.setStateHelper( st => {
            console.log('[BaseRetailAppReactMainPanel] menerima data lookup :' , lookupId , ',data :' , lookupData); 
            let l: {[id: string ]:   CommonCommunicationData.CommonLookupValue[] } =  st.lookups || {};
            l[lookupId] = lookupData ; 
            let d: any = {lookups :  l } ; 
            d[  lookupId ] = lookupData ;
        });
    }
    constructor(props: PROPS) {
        super(props) ; 
        this.ajaxUtils = ajaxhelper.generateOrGetAjaxUtils(); 
        this.state = this.generateDefaultState() ; 
        this.assignQueryHandler = ( field: string , whereValue: any  ) => {
            this.getGrid().assignQueryHandler(field , whereValue);
        };
        this.assignQueryOnIncludeModel = (modelName: string , fieldName: string ,  whereValue: any , useInnerJoin: boolean  , modelAs ?: string ) => {
            this.getGrid().assignQueryOnIncludeModel(modelName , fieldName , whereValue , useInnerJoin, modelAs);
        };
        this.lookupManager = ListOfValueComponent.generateLookupManager( this.ajaxUtils);
        this.reloadGrid = () => {
            this.getGrid().reloadGrid(); 
        };
    }

    componentDidMount () {
        let ids: string[] =    this.lookupManager.getLookupIds();
        if (ids.length > 0) {
            this.lookupManager.loadFromCacheAndGenerateLookupRequest((resp: CommonCommunicationData.LookupRequestData[]) => {
                this.lookupManager.requestLookupData({
                    dataIdAsString: null!,
                    modelName: null!,
                    onLookupAccepted: (lks: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => {
                        //
                    }
                });
            });
        }
    }
    /**
     * generate default state 
     */
    abstract generateDefaultState (): STATE ; 
    /**
     * akses ke grid. silakan pergunakan ref untuk keperluan ini
     */
    abstract getGrid (): SimpleDbDrivenGrid<DATA> ; 
    /**
     * renderer
     */
    abstract render(): JSX.Element ; 

}