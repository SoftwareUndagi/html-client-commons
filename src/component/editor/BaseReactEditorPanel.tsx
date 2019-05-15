
import { CoreBaseReactEditorPanel , CoreBaseReactEditorPanelState  } from 'core-client-commons';
/**
 * editor state untuk editor data
 */
export interface BaseEditorState<DATA> extends CoreBaseReactEditorPanelState<DATA> { }
/**
 * base interface untuk untuk editor
 */
export abstract class BaseReactEditorPanel<DATA  , PROP , STATE extends BaseEditorState<DATA>> extends CoreBaseReactEditorPanel<DATA , PROP , STATE>  {
    static DEFAULT_BUTTON_LABEL_SAVE_DELETE: () => string = () => {
        return 'hapus';
    } 
    static DEFAULT_BUTTON_LABEL_SAVE_ADD: () => string = () => {
        return 'tambah';
    }
    static DEFAULT_BUTTON_LABEL_SAVE_EDIT: () => string = () => {
        return 'edit';
    }
    static DEFAULT_BUTTON_LABEL_CLOSE: () => string = () => {
        return 'tutup';
    }
}