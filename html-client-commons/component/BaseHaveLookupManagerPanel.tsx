
import { CommonCommunicationData , ListOfValueManager } from 'core-client-commons/index' ;
import { ListOfValueComponent } from './ListOfValueComponent';
import { isNull  } from '../utils/index';
import { BaseHtmlComponent , BaseHtmlComponentProps , BaseHtmlComponentState  } from './BaseHtmlComponent';
export interface BaseHaveLookupManagerPanelState extends BaseHtmlComponentState {
    /**
     * lookup di index
     */
    lookups: {[id: string]: CommonCommunicationData.CommonLookupValue[] } ;

}

/**
 * base class untuk panel dengan lookup manager. 
 */
export abstract class BaseHaveLookupManagerPanel<PROPS extends BaseHtmlComponentProps, STATE extends BaseHaveLookupManagerPanelState> extends BaseHtmlComponent<PROPS , STATE> {
    /**
     * default worker untuk assign loookup. ini akan otomatis menaruh data ke dalam state
     */
    assignLookupData:  (lookupId: string , lookupData: CommonCommunicationData.CommonLookupValue[] ) => any ;
    /**
     * lookup manager untuk di bind dengan lookup
     */
    lookupManager: ListOfValueManager  ; 

    constructor(props: PROPS) {
        super(props) ; 
        this.lookupManager =  ListOfValueComponent.generateLookupManager( );
        this.state = this.generateDefaultState() ; 
        this.assignLookupData = (lookupId: string , lookupData: CommonCommunicationData.CommonLookupValue[] ) => {
            //
        };
    }

    componentDidMount () {
        this.lookupManager.requestLookupData(
            {
                onLookupAccepted: this.onLookupAccepted
            }  ,  
            this.onLovRequestDataComplete
       );
    }

    /**
     * per lookup data . per data di terima. karena keungkinan data di terima partial
     */
    onLookupAccepted: (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[]}) => any = (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[]}) => {
        let keys: string[] = !isNull(indexedLookup) ?  Object.keys(indexedLookup)   : [] ; 
        if ( keys.length > 0 ) {
            this.setStateHelper ( 
                sln => { 
                    if ( isNull(sln.lookups)) {
                        sln.lookups = {} ; 
                    }
                    for ( let k of keys) {
                        sln.lookups[k] = indexedLookup[k];
                        sln.lookups['lookups_' + k] = indexedLookup[k];
                    }
                }
            );    
        }
    }

    /**
     * final setelah request ke lookup , semua data lookup sudah di terima
     */
    onLovRequestDataComplete: (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => any =  (indexedLookup: { [id: string]: CommonCommunicationData.CommonLookupValue[] }) => {
        if ( isNull(indexedLookup)) {
            return   ; 
        }
        let keys: string [] = Object.keys(indexedLookup); 
        if ( keys.length === 0 ) {
            return  ; 
        }
        this.setStateHelper( sln => {
            if ( isNull( this.state.lookups) ) {
                    sln.lookups = {} ; 
            }
            for ( let k of keys ) {
                sln.lookups[k] = indexedLookup[k]; 
            }
            return  ; 
        }); 
    }

    /**
     * generate initial state 
     */
    abstract generateDefaultState (): STATE ; 
}