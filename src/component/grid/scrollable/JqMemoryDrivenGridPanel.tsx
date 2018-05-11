import {  isNull , ObjectUtils } from '../../../utils/index';
import { editorsupport } from '../../editor/editorsupport';
import { BaseGridPanelProps , BaseGridPanelState , BaseGridPanel } from './JqBaseGridPanel';

export interface JqMemoryDrivenGridPanelProps<DATA> extends BaseGridPanelProps<DATA> {
    /**
     * worker untuk membaca data dari data container. ini di pergunakan kalau anda berencana memfilter data dalam grid. 
     */
    fetcherDataFromDataContainer?: (dataContainer: editorsupport.ClientSideEditorContainer<DATA>) => DATA[]; 
    /**
     * data container
     */
    dataContainer: editorsupport.ClientSideEditorContainer<DATA>; 
}

export interface JqMemoryDrivenGridPanelState<DATA> extends BaseGridPanelState<DATA> {
    //
} 
/**
 * scrollable grid untuk memory driven data
 */
export class JqMemoryDrivenGridPanel<DATA> extends BaseGridPanel<DATA, JqMemoryDrivenGridPanelProps<DATA>, JqMemoryDrivenGridPanelState<DATA>> {
    /**
     * field pembanding prop untuk pengecekan perubahan props
     */
    static KEYS_ONPROP_FOR_CHECK_SHOULD_UPDATE: Array<string> = ['spaceUsedOnLeftSide',	'spaceUsedOnRightSide',	'gridTitle',	'gridHeight',	'gridMinimumWidth',	'width',	'actionColumnTitle',	'actionColumnWidth',	'rowNumberParam.headerLabel',	'rowNumberParam.width',	'hidden',	'noVerticalScroll',	'minimumHeight',	'fetcherDataFromDataContainer'] ; 
    /**
     * key pada state untuk mengecek element perlu update atau tidak
     */
    static KEYS_ONSTATE_FOR_CHECK_SHOULD_UPDATE: Array<string> = ['listData',	'selectedData',	'selectedRowindex',	'headerCollapsed',	'widthComputedColumn',	'showingLoadBlockerPanel']; 

    /**
     *  flag apakah data container change sudah di bind atau tidak
     */
    dataContainerchangeListenerBinded: boolean  = false; 
    /**
     * register change handler untuk data container. untuk melepas pada saat unmount
     */
    private unregisterDataContainerChangeHandler: editorsupport.UnregisterChangeHandlerWorker ; 

    constructor(props: JqMemoryDrivenGridPanelProps<DATA>) {
        super(props); 
        if ( !this.dataContainerchangeListenerBinded) {
            this.unregisterDataContainerChangeHandler = props.dataContainer.registerChangeHandler( this.copyDataFromContainer.bind(this));
        }
        this.copyDataFromContainer(false, props); 
    }
    generateDefaultState (): JqMemoryDrivenGridPanelState<DATA> {
        return {
            gridButtons : [] , 
            headerCollapsed : false , 
            listData : [] , 
            lookupContainers : {} ,
            selectedData : null !, 
            selectedRowindex : 0,
            columnDefinitions : [], 
            widthComputedColumn : 100 , 
            showingLoadBlockerPanel : false , 
            rowStateContainer : []
        };
    }
    shouldComponentUpdate(nextProps: JqMemoryDrivenGridPanelProps<DATA> , nextState: JqMemoryDrivenGridPanelState<DATA>) {
        if ( this.compareForShouldComponentUpdateStateOrProp(JqMemoryDrivenGridPanel.KEYS_ONPROP_FOR_CHECK_SHOULD_UPDATE , nextProps , this.props)  ||
            this.compareForShouldComponentUpdateStateOrProp(JqMemoryDrivenGridPanel.KEYS_ONSTATE_FOR_CHECK_SHOULD_UPDATE , nextState , this.state)) {
                return true ; 
        }
        let cmp: Array<boolean> =  this.readButtonEnableFlag();
        try {
            if ( ObjectUtils.hiLevelArrayCompare(cmp , this.buttonEnabledFlagArray) ) {
                return true ; 
            }
            for ( let i = 0 ; i < cmp.length ; i++) {
                if ( cmp[i] !== this.buttonEnabledFlagArray[i]) {
                    return true ; 
                }
            }
        } finally {
            this.buttonEnabledFlagArray = cmp ; 
        }
        return false ; 
    }

    componentWillUnmount() {
        this.dataContainerchangeListenerBinded = false ; 
        if ( !isNull(this.unregisterDataContainerChangeHandler)) {
            this.unregisterDataContainerChangeHandler();
            this.unregisterDataContainerChangeHandler = null! ; 
        }
    }

    copyDataFromContainer ( updateState ?: boolean , sourceProps?: JqMemoryDrivenGridPanelProps<DATA>) {
        let actualSrcProps: JqMemoryDrivenGridPanelProps<DATA> = !isNull(sourceProps) ? sourceProps! : this.props ; 
        if  ( !isNull(actualSrcProps.fetcherDataFromDataContainer)) {
            this.assignData(actualSrcProps.fetcherDataFromDataContainer!(actualSrcProps.dataContainer));
        } else {
            this.assignData(actualSrcProps.dataContainer.getAllStillExistData()); 
        }
        if ( !isNull(updateState) && updateState) {
            return ; 
        }
        this.setStateHelper (st => { 
            //
        });
    }

}