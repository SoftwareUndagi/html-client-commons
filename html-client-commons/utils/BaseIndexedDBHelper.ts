import { isNull } from './CommonUtils';

/**
 * definisi index untuk local model
 */
export interface LocalModelIndexDefinition {

    /**
     * nama index 
     */
    indexName: string ;
    /**
     * nama field yang di baca dalam data di simpan
     */ 
    keyPath: string ; 
    /**
     * param optional untuk definisi index
     */
    optionalParam ?: IDBIndexParameters; 
}

/**
 * definisi model indexed db
 */
export interface LocalDBModelDefinition {
    /**
     * nama model local
     */
    modelName: string  ;

    /**
     * parameters untuk primary key 
     */
    keyParameter ?:  IDBObjectStoreParameters ;
    /**
     * keys dari locale data
     */
    keys ?: LocalModelIndexDefinition[]; 
}

/**
 * class untuk helper indexed db
 */
export abstract class BaseIndexedDBHelper {

    /**
     * database yang sudah di open
     */
    openedDatabase: IDBDatabase ; 
    /**
     * @param databaseName nama database untuk di open
     * @param version versi dari database untuk di upen
     */
    constructor ( public databaseName: string  , version: number ) {
        let request: IDBOpenDBRequest =  indexedDB.open('' , 1);
        request.onupgradeneeded = (ev: IDBVersionChangeEvent) => {
            let db: IDBDatabase = ev.target!['result'] ; // ev.target['result'] ;
            this.onUpgradeNeeded(db , ev) ;
        };
        request.onerror = (evt ) => {
            this.onError(evt) ; 
        };
        request.onsuccess = ( evt: any ) => {
            this.openedDatabase = request.result ; 
        };
    }

    /**
     * handler pada saat perlu initiate data
     */
    abstract onUpgradeNeeded (db: IDBDatabase  , ev: IDBVersionChangeEvent ) ; 

    /**
     * kalau koneksi ke database error
     */
    abstract onError(evt: any ); 

    /**
     * worker untuk membuat datastore baru
     */
    generateObjectStoreHelper ( database: IDBDatabase ,  modelDefinition: LocalDBModelDefinition ) {
        let store: IDBObjectStore =  database.createObjectStore( modelDefinition.modelName , modelDefinition.keyParameter);
        if ( !isNull(modelDefinition.keys)) {
            for ( let l of modelDefinition.keys!) {
                store.createIndex(  l.indexName, l.keyPath, l.optionalParam );
            }
        }
    }

}