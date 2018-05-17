import { BaseClientBootStrap , ClientBootStrapParameter } from './BaseClientBootStrap' ;
import { ajaxhelper } from '../utils/ajaxhelper'; 
import { ClientStorageUtils } from '../utils/ClientStorageUtils';
import { isNull  , ClientCommonsConstant } from '../utils/CommonUtils';

export class ClientCommonsBootstrap extends BaseClientBootStrap {

    /**
     * key untuk db metadata
     */
    static   DB_METADATA_KEY: string = '_db_metadata';

    /**
     * run bootstrap client app
     */
    bootStrap ( param: ClientBootStrapParameter) {
        this.doReadColumnMetadata().then( d => {
            //
        }).catch(exc => {
            //
        });
        
    }

    doReadColumnMetadata (): Promise<any> {
        return new Promise<any> (  ( accept: (n: any ) => any , reject: (exc: any) => any ) => {
            let key: string = this.projectCode + ClientCommonsConstant.KEY_DB_COLUMN_DEF_ON_LOCAL_STORAGE + '_sync' ; 
            let syncTime: string = localStorage.getItem(key)!; 
            let needSync: boolean = true ; 
            if ( !isNull(syncTime) ) {
                let dt: Date = new Date(syncTime) ; 
                let dSKr: Date  = new Date() ; 
                let selisih: number = (dSKr.getTime() - dt.getTime()) / 1000 / 120 ; // 2 jam 
                if ( selisih > 1) {
                    needSync = false ; 
                    let s: string = localStorage.getItem(this.projectCode + ClientCommonsConstant.KEY_DB_COLUMN_DEF_ON_LOCAL_STORAGE) !; 
                    if ( !isNull(s)) {
                        window[ClientCommonsConstant.KEY_DB_COLUMN_DEF_ON_WINDOW] = JSON.parse(s);  
                    } else {
                        window[ClientCommonsConstant.KEY_DB_COLUMN_DEF_ON_WINDOW] = {};  
                    }
                }
            }
            if ( needSync) {
                try {
                    ajaxhelper.generateOrGetAjaxUtils().post('/dynamics/system/db-metadata-service/all' , {})
                        .then( (dt: {[id: string]: {[id: string]: number }  }) => {
                            window[ClientCommonsConstant.KEY_DB_COLUMN_DEF_ON_WINDOW] = dt ;
                            if ( !isNull(dt)) {
                                new ClientStorageUtils().setValue( key , new Date().toJSON() , () => {
                                    //
                                }  ); 
                                new ClientStorageUtils().setValue( this.projectCode + ClientCommonsConstant.KEY_DB_COLUMN_DEF_ON_LOCAL_STORAGE , JSON.stringify(dt) , () => {
                                    //
                                }  ); 
                            }

                        } ).catch(reject);
                    
                } catch ( exc) {
                    console.error('Gagal membaca data : ' , exc) ; 
                    reject(exc);
                }
                return ; 
                
            }
            accept({});
            
        }); 
    }
}