import { ajaxhelper } from './ajaxhelper';
import {  HTMLClientCommonData, ModelFieldLengthExtended } from '../shared/index';
import { CoreAjaxHelper  } from 'core-client-commons' ; 
import { ModelFieldLength} from 'base-commons-module'
/**
 * reader metadata tablde dari server
 */
export class ApplicationTableMetadataReader {
    /**
     * key untuk menaruh cache di window scope
     */
    static KEY_CACHE_ON_WINDOW = 'applicationDatabaseMetadataCatalog' ; 
    ajaxUtils: CoreAjaxHelper = ajaxhelper.generateOrGetAjaxUtils();

    /**
     * membaca metata dari model
     * @param modelName 
     */
    static getMetadata ( modelName: string ): ModelFieldLengthExtended {
        let  modelDefinitions: {[id: string]: ModelFieldLengthExtended } = window[ApplicationTableMetadataReader.KEY_CACHE_ON_WINDOW] ; 
        if ( !modelDefinitions) {
            let s: any = null ; 
            return s ; 
        }
        return modelDefinitions[modelName] ; 
    }
    /**
     * request data dari server
     */
    requestMetadata(): Promise<ModelFieldLength[]> {
        return new Promise<ModelFieldLength[]>( (fullfill: (n: ModelFieldLength[]) => any, reject: (exc: any) => any) => {
            let rtvl: any[] = [] ; 
            this.requestMetadataWorker(0, rtvl)
                .then(rslt => {

                    this.buildCache(rtvl) ;     
                })
                .catch(reject);
        });
    }

    requestMetadataWorker( index: number, resultContainer: ModelFieldLength[] ): Promise<any> {
        return new Promise<any>( (fullfill: (n: any) => any, reject: (exc: any) => any) => {
            this.ajaxUtils.get('/dynamics/system/db-metadata-provider/' + index)
                .then( (hsl: any []) => {
                    if ( !hsl || hsl.length !== 50) {
                        fullfill({}); 
                        return ; 
                    }
                    else if ( hsl && hsl.length > 0) {
                        resultContainer.push(...hsl) ;
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
    protected _requestMetadataWorker(page: number): Promise<ModelFieldLength> {
        return this.ajaxUtils.get('/dynamics/system/db-metadata-provider/' + page);
    }

    private buildCache(definition: ModelFieldLength[]) {
        window[ApplicationTableMetadataReader.KEY_CACHE_ON_WINDOW] = {}; 
        let modelDefinitions: {[id: string]: ModelFieldLengthExtended } = window[ApplicationTableMetadataReader.KEY_CACHE_ON_WINDOW] ; 
        definition.forEach( d => {
            modelDefinitions[d.modelName] = HTMLClientCommonData.makeExtendedModelFieldDef(d) ;
        });
    }

}