
import { CoreBaseSubEditorPanelProps , CoreBaseSubEditorPanelState , CoreBaseSubEditorPanel } from 'core-client-commons';

export interface BaseSubEditorPanelState<DATA> extends CoreBaseSubEditorPanelState<DATA> {
}
export interface BaseSubEditorPanelProps extends CoreBaseSubEditorPanelProps { }
/**
 * base sub editor
 */
export abstract class BaseSubEditorPanel<DATA , PROPS extends BaseSubEditorPanelProps, STATE extends BaseSubEditorPanelState<DATA> > extends CoreBaseSubEditorPanel<DATA ,  PROPS , STATE> { }