
import * as React from "react" ;
import { BaseReactEditorPanel  } from "./BaseReactEditorPanel";
import { ReactEditorBannerMessage , CoreAjaxHelper , ListOfValueManager , CoreBaseDirectDbDrivenEditorPanel ,  CoreBaseDirectDbDrivenEditorPanelProps , CoreBaseDirectDbDrivenEditorPanelState } from 'core-client-commons';
import { getCssForColumnWithScreenType , getDbModelFieldMaxLength } from '../../utils/index';
import { ListOfValueComponent } from '../ListOfValueComponent';
import { ajaxhelper } from '../../utils/ajaxhelper';

/**
 * state untuk data id
 */
export interface BaseDirectDbDrivenEditorPanelState <DATA , ID > extends CoreBaseDirectDbDrivenEditorPanelState<DATA , ID> {
    
}

/**
 * propseditor. passed ke dalam editor
 */
export interface BaseDirectDbDrivenEditorPanelProps<DATA , ID >  extends CoreBaseDirectDbDrivenEditorPanelProps <DATA , ID > {
    
}

/**
 * interface untuk editor dengan DB driven 
 */
export abstract class BaseDirectDbDrivenEditorPanel<DATA , ID  , PROP extends CoreBaseDirectDbDrivenEditorPanelProps<DATA , ID>, STATE extends BaseDirectDbDrivenEditorPanelState<DATA, ID>> extends CoreBaseDirectDbDrivenEditorPanel<DATA , ID , PROP , STATE>  {
    /**
     * midle class dari bootstrap
     */
    bootstrapColumnClass: string = getCssForColumnWithScreenType(); 
    /**
     * default handler untuk submit
     */
    defaultSubmitHandler: (evt: any ) => any = (evt: any ) => {
        evt.preventDefault() ;
        if ( this.state.editorState === 'add') {
            this.saveAdd(); 
        } else if ( this.state.editorState === 'edit') {
            this.saveEdit(); 
        
        } else if ( this.state.editorState === 'delete') {
            this.saveDelete();  
        }
        return false ;
    }
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
        if ( !modelName) {
            modelName = this.getModelName(); 
        }
        return getDbModelFieldMaxLength(modelName! , fieldName) ;
    }

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
        return  ListOfValueComponent.generateLookupManager(  this.ajaxUtils ); 
    }
    /**
     * menaruh ke data banner message untuk di render ke dalam error info
     * @param messages messages untuk di taruh
     */
    putToBannerMessage ( messages: ReactEditorBannerMessage[] ) {
        this.setStateHelper ( sln => sln.bannerMessages = !messages ? null! :  messages   );
    }

    /**
     * renderer editor button untuk form
     */
    rendererTaskEditorButton (tabIndex ?: number ) {

        if ( !tabIndex ) {
            tabIndex = 0; 
        }
        let btnSave: any[]  = []; 
        if ( this.editorState === 'delete') {
            btnSave = [(
            <button 
                key='btn_save_del' 
                type='submit' 
                className='btn  btn-warning' 
                tabIndex={tabIndex! + 1} 
                disabled={!this.state.editingModeEnabled}
            >
                <i className="fa fa-trash"/>&nbsp;{BaseReactEditorPanel.DEFAULT_BUTTON_LABEL_SAVE_DELETE()}
            </button>) ];
        } else if ( this.editorState === 'add'  )  {
            btnSave = [ (
            <button 
                key='btn_save_edit_or_add' 
                type='submit' 
                className='btn  btn-primary'  
                tabIndex={tabIndex! + 1}  
                disabled={!this.state.editingModeEnabled}
            >
                 <i className="fa fa-floppy-o"/>&nbsp;{BaseReactEditorPanel.DEFAULT_BUTTON_LABEL_SAVE_ADD()}
            </button>) ];
        } else if (this.editorState === 'edit') {
            btnSave = [ (
            <button 
                key='btn_save_edit_or_add' 
                type='submit' 
                className='btn  btn-primary'  
                tabIndex={tabIndex! + 1}  
                disabled={!this.state.editingModeEnabled}
            ><i className="fa fa-floppy-o"/>&nbsp;{BaseReactEditorPanel.DEFAULT_BUTTON_LABEL_SAVE_EDIT()}
            </button> )];
        }

        return (
        <div className='row buttons-widget'>
            <div className={'col-' + this.bootstrapColumnClass + '-12 margin-bottom-30'} >
                {btnSave} &nbsp;
                <button 
                    key='editor_button_close' 
                    type='button'  
                    tabIndex={tabIndex! + 2} 
                    className='btn btn-primary'  
                    onClick={this.close}
                >
                 <i className="fa fa-times"/>&nbsp;{BaseReactEditorPanel.DEFAULT_BUTTON_LABEL_CLOSE()}
                </button>
            </div>
        </div>
        ); 
    }

}