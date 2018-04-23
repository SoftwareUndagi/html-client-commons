import { BaseSearchableComboBoxMultiple, BaseSearchableComboBoxMultipleProps, BaseSearchableComboBoxMultipleState } from '../../BaseSearchableComboBoxMultiple';
import { isNull, EditorInputElement, CommonCommunicationData } from 'core-client-commons/index';

export interface BaseEditorSearchableComboBoxMultipleProps extends BaseSearchableComboBoxMultipleProps { 

    /**
     * fetched id (untuk lookup) 
     */
    fetchValueIdsFromData: (data: any) => Array<string>;

    /**
     * register control ke dalam list of component pada perent
     */
    registrarMethod: (control: any , unregFlag?: boolean ) => any ;
    /**
     * assign data dari control ke data
     * @param internalControlEnabled true berarti enabled, false, berarti item di disable. ini mungkin perlu clean up data attribute dari target
     */
    assignValuesTodata: (targetData: any,  selectedValues: string[] , lookupContainer: CommonCommunicationData.CommonLookupValue [] ) => any;

}
export interface BaseEditorSearchableComboBoxMultipleState extends BaseSearchableComboBoxMultipleState { }

/**
 * control tiruan select2 
 */
export abstract class BaseEditorSearchableComboBoxMultiple<PROPS extends EditorSearchableComboBoxMultipleProps , STATE extends EditorSearchableComboBoxMultipleState> extends BaseSearchableComboBoxMultiple<PROPS, STATE> implements EditorInputElement {

    constructor(props: PROPS) {
        super(props);
        if ( !isNull(props.registrarMethod)) {
            props.registrarMethod(this); 
        }
    }
    assignDataToControl(data: any, updateState?: boolean) {
        let val: string[] = this.props.fetchValueIdsFromData(data) ; 
        if ( !isNull(updateState) && !updateState) {
            this.assignValueWorker( this.state ,   val) ; 
        } else {
            this.setStateHelper( st => this.assignValueWorker( st ,   val) );
        }
    }

    componentWillUnmount() {
        if ( !isNull(this.props.registrarMethod)) {
            this.props.registrarMethod(this, true); 
        }
    }

    fetchDataFromControl(data: any) {
        this.props.assignValuesTodata(data ,  this.state.values , this.props.lookupParameter.lookupContainers[this.props.lookupParameter.lovId]) ; 
    }

    protected assignValueWorker ( targetState: STATE , values: string[ ]) {
        targetState.values = values ; 
        targetState.valueLookups = {} ; 
        if ( !isNull(values) && !isNull(this.props.lookupParameter.lookupContainers[this.props.lookupParameter.lovId])) {
            for ( let v of values) {
                for ( let x of this.props.lookupParameter.lookupContainers[this.props.lookupParameter.lovId]) {
                    if (( v + '')  === (x.detailCode + '') )  {
                        targetState.valueLookups[x.detailCode!] = x  ; 
                        if (x.detailCode !== (x.detailCode + '')) { // kalau key = number. tambahkan versi string dari indexer
                            targetState.valueLookups[x.detailCode + ''] = x; 
                        }
                        break ; 
                    }
                }
            }
        }
    }
    render(): JSX.Element {
        return this.renderNormalSelector();
    }

}

export interface EditorSearchableComboBoxMultipleProps extends BaseEditorSearchableComboBoxMultipleProps { }
export interface EditorSearchableComboBoxMultipleState extends BaseSearchableComboBoxMultipleState { }
/**
 * control tiruan select2 
 */
export class EditorSearchableComboBoxMultiple extends BaseEditorSearchableComboBoxMultiple<EditorSearchableComboBoxMultipleProps, EditorSearchableComboBoxMultipleState> implements EditorInputElement {
    generateDefaultState(): EditorSearchableComboBoxMultipleState {
        return {
            valueHaveSetted : false , 
            valueLookups : {} , 
            values : [] , 
            versioner : 1 , 

        };
    }

    render(): JSX.Element {
        return this.renderNormalSelector();
    }

}