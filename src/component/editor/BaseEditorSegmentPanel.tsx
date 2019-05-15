import { CoreBaseEditorSegmentPanel, CoreBaseEditorSegmentPanelProps, CoreBaseEditorSegmentPanelState } from 'core-client-commons';
import { getDbModelFieldMaxLength } from '../../utils/index';

export interface BaseEditorSegmentPanelProps <DATA> extends CoreBaseEditorSegmentPanelProps<DATA> {}

export interface BaseEditorSegmentPanelState <DATA> extends CoreBaseEditorSegmentPanelState<DATA> {} 

/**
 * segment helper dari editor. agar bisa break down editor dalam component-component
 */
export abstract class BaseEditorSegmentPanel<DATA , PROPS extends BaseEditorSegmentPanelProps<DATA> , STATE extends BaseEditorSegmentPanelState<DATA>>  extends CoreBaseEditorSegmentPanel <DATA , PROPS , STATE>  {
    /**
     * ini di pergunakan untuk menaruh max length dalam textbox.<br/>
     * misal table sec_user field : username di database panjang = 128.<br/>
     * <ol> 
     * <li>nama model sequelize : ApplicationUserSimple </li>
     * <li>nama field sequelize : userName </li>
     * </ol>
     * di akses dengan : this.getColMaxLength('userName' , 'ApplicationUserSimple')<br/>
     * 
     * @param fieldName nama field js untuk di baca metadata
     * @param modelName nama model dair object penyimpanan data. ini optional.di sediakan default untuk item ini
     */
    getColMaxLength (fieldName: string , modelName ?: string ): number {
        if ( !modelName ) {
            modelName = this.modelName; 
        }
        return getDbModelFieldMaxLength(modelName , fieldName) ;
    }
}