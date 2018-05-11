import { CoreBaseReactMemoryDrivenEditorPanel , CoreBaseReactMemoryDrivenEditorPanelProps , 
        CoreBaseReactMemoryDrivenEditorPanelState , CoreAjaxHelper  , ListOfValueManager } from 'core-client-commons';
import { ajaxhelper } from '../../utils/index';
import { ListOfValueComponent  } from '../ListOfValueComponent';
export interface BaseReactMemoryDrivenEditorPanelState<DATA> extends CoreBaseReactMemoryDrivenEditorPanelState<DATA> { } 
export interface BaseReactMemoryDrivenEditorPanelProps<DATA>  extends CoreBaseReactMemoryDrivenEditorPanelProps<DATA> { } 

/**
 * base class untuk memory driven data
 */
export abstract class BaseReactMemoryDrivenEditorPanel<DATA , PROPS extends BaseReactMemoryDrivenEditorPanelProps<DATA> , STATE extends  BaseReactMemoryDrivenEditorPanelState<DATA>> extends CoreBaseReactMemoryDrivenEditorPanel<DATA , PROPS, STATE> {

    /**
     * generate ajax utils
     */
    generateAjaxUtils (): CoreAjaxHelper  {
        return ajaxhelper.generateOrGetAjaxUtils() ; 
    }
    
    /**
     * generator lookup manager sesuai dengan penyedia, web atau react akan berbeda untuk bagian ini
     */
    generateLookupManager (): ListOfValueManager {
        return    ListOfValueComponent.generateLookupManager( this.ajaxUtils ); 
    }

}
