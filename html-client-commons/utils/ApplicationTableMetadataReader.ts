import { ajaxhelper } from './ajaxhelper';
import {  HTMLClientCommonData } from '../shared/index';
import { CommonCommunicationData } from 'core-client-commons';
import { isNull } from 'core-client-commons';

/**
 * reader metadata tablde dari server
 */
export class ApplicationTableMetadataReader {
    /**
     * key untuk menaruh cache di window scope
     */
    static KEY_CACHE_ON_WINDOW = 'applicationDatabaseMetadataCatalog' ; 
    ajaxUtils: ajaxhelper.AjaxUtils = ajaxhelper.generateOrGetAjaxUtils();

    /**
     * membaca metata dari model
     * @param modelName 
     */
    static getMetadata ( modelName: string ): HTMLClientCommonData.ModelFieldLengthExtended {
        let  modelDefinitions: {[id: string]: HTMLClientCommonData.ModelFieldLengthExtended } = window[ApplicationTableMetadataReader.KEY_CACHE_ON_WINDOW] ; 
        if ( isNull(modelDefinitions)) {
            let s: any = null ; 
            return s ; 
        }
        return modelDefinitions[modelName] ; 
    }
    /**
     * request data dari server
     */
    requestMetadata(): Promise<CommonCommunicationData.ModelFieldLength[]> {
        return new Promise<CommonCommunicationData.ModelFieldLength[]>( (fullfill: (n: CommonCommunicationData.ModelFieldLength[]) => any, reject: (exc: any) => any) => {
            let rtvl: any[] = [] ; 
            this.requestMetadataWorker(0, rtvl)
                .then(rslt => {

                    this.buildCache(rtvl) ;     
                })
                .catch(reject);
        });
    }

    requestMetadataWorker( index: number, resultContainer: CommonCommunicationData.ModelFieldLength[] ): Promise<any> {
        return new Promise<any>( (fullfill: (n: any) => any, reject: (exc: any) => any) => {
            this.ajaxUtils.get('/dynamics/system/db-metadata-provider/' + index)
                .then( (hsl: any []) => {
                    if ( !isNull(hsl) && hsl.length > 0) {
                        resultContainer.push(...hsl) ;
                    }
                    if ( isNull(hsl) || hsl.length !== 50) {
                        fullfill({}); 
                        return ; 
                    }
                    this.requestMetadataWorker(index + 1 , resultContainer).then(fullfill).catch(reject);
                })
                .catch(reject);
        });
    }
    /**
     * 
     * @param page 
     */
    protected _requestMetadataWorker(page: number): Promise<CommonCommunicationData.ModelFieldLength> {
        return this.ajaxUtils.get('/dynamics/system/db-metadata-provider/' + page);
    }

    private buildCache(definition: CommonCommunicationData.ModelFieldLength[]) {
        window[ApplicationTableMetadataReader.KEY_CACHE_ON_WINDOW] = {}; 
        let modelDefinitions: {[id: string]: HTMLClientCommonData.ModelFieldLengthExtended } = window[ApplicationTableMetadataReader.KEY_CACHE_ON_WINDOW] ; 
        definition.forEach( d => {
            modelDefinitions[d.modelName] = HTMLClientCommonData.makeExtendedModelFieldDef(d) ;
        });
    }

}