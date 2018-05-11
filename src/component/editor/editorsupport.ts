import { ClientSideEditorContainer as xx1 , MoficationDataResultContainer as xx2 } from 'core-client-commons' ; 
/**
 * container data sisi client
 */
export namespace editorsupport {

    /**
     * untuk detach event
     */
    export interface UnregisterChangeHandlerWorker {

        (): any;
    }

    export class ClientSideEditorContainer<DATA>  extends xx1<DATA> {}

    export interface MoficationDataResultContainer<DATA> extends xx2<DATA> {}
}