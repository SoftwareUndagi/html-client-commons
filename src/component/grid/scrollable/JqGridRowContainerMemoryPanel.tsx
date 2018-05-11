import { JqGridRowContainerBasePanel , JqGridRowContainerBasePanelProps , JqGridRowContainerBasePanelState } from './JqGridRowContainerBasePanel';
import { editorsupport , isNull } from 'core-client-commons';

export interface JqGridRowContainerMemoryPanelProps<DATA> extends JqGridRowContainerBasePanelProps<DATA> { 
    /**
     * worker untuk membaca data dari data container. ini di pergunakan kalau anda berencana memfilter data dalam grid. 
     */
    fetcherDataFromDataContainer?: (dataContainer: editorsupport.ClientSideEditorContainer<DATA>) => DATA[]; 
    /**
     * data container
     */
    dataContainer: editorsupport.ClientSideEditorContainer<DATA>; 
}

export interface JqGridRowContainerMemoryPanelState<DATA>  extends JqGridRowContainerBasePanelState<DATA> {} 

/**
 * memory row data container. untuk data dengan sumber clientdatacontainer
 */
export class JqGridRowContainerMemoryPanel<DATA> extends JqGridRowContainerBasePanel<DATA, JqGridRowContainerMemoryPanelProps<DATA>, JqGridRowContainerMemoryPanelState<DATA>> {
    
    /**
     *  flag apakah data container change sudah di bind atau tidak
     */
    dataContainerchangeListenerBinded: boolean  = false; 
    /**
     * register change handler untuk data container. untuk melepas pada saat unmount
     */
    private unregisterDataContainerChangeHandler: editorsupport.UnregisterChangeHandlerWorker ; 

    constructor(props: JqGridRowContainerMemoryPanelProps<DATA>) {
        super(props);
        if ( !this.dataContainerchangeListenerBinded) {
            this.unregisterDataContainerChangeHandler = props.dataContainer.registerChangeHandler( this.copyDataFromContainer.bind(this));
        }
        this.copyDataFromContainer(false, props); 

    }
    generateDefaultState(): JqGridRowContainerMemoryPanelState<DATA> {
        return {
            gridDataJoinedLookups : {} , 
            listData : null! ,
            rowStateContainer : [] , 
            selectedData : null! , 
            selectedRowindex : -1    
        };
        
    }

    componentWillUnmount() {
        this.dataContainerchangeListenerBinded = false ; 
        if ( !isNull(this.unregisterDataContainerChangeHandler)) {
            this.unregisterDataContainerChangeHandler();
            this.unregisterDataContainerChangeHandler = null! ; 
        }
    }

    copyDataFromContainer ( updateState ?: boolean , sourceProps?: JqGridRowContainerMemoryPanelProps<DATA> ) {
        let actualSrcProps: JqGridRowContainerMemoryPanelProps<DATA> = !isNull(sourceProps) ? sourceProps! : this.props ; 
        let listData: any =  !isNull(actualSrcProps.fetcherDataFromDataContainer) ? 
            this.props.fetcherDataFromDataContainer!(actualSrcProps.dataContainer)  : 
            this.props.dataContainer.getAllStillExistData();
        if ( !isNull(updateState) && updateState) {
            let sln: any = this.state ; 
            sln.listData = listData ; 
            return ; 
        } else {
            this.setStateHelper ( 
                sln => {
                    this.assignData( listData , sln );    
                    return sln ; 
                });
        }
    }
}