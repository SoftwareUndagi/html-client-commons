export interface StorageEvent {

    /**
     * key dari storage
     */
    key: string; 

    /**
     * nilai lama, dalam kasus update value
     */
    oldValue?: string; 

    /**
     * nilai baru dari data
     */
    newValue?: string; 

    /**
     * url pemilik data
     */
    url: string; 

}

/**
 * utils untuk local storage / atau chrome storage
 */
export class ClientStorageUtils {
    
    useChrome: boolean ; 
    chromeRef: any  ; 
    
    constructor() {
        this.chromeRef = window["chrome"] || null ;
        if ( this.chromeRef == null || this.chromeRef.storage == null || typeof  this.chromeRef.storage === "undefined") {
            this.useChrome = false ;
            console.log("Storage utils di initiate, dengan tipe localstorage");
        } else {
            this.useChrome = true ;
            console.log("Storage utils di initiate, dengan tipe chrome storage"); 
        }
        
    }

    /**
     * register storage handler
     * @param handler
     */
    registerHandler(handler: (evt: StorageEvent) => any) {
        let s: any = handler;
        window.addEventListener('storage', s);
    }

    /**
     * remove event handler dari storage event
     * @param handler method handler
     */
    unRegisterHandler(handler: (evt: StorageEvent) => any) {
        let s: any = handler; 
        window.removeEventListener('storage', s);
    }

    /**
     * set item ke dalam storage
     * @param key key dari data
     * @param value value untuk di set
     * @param onComplete handler pada saat task complete
     */
    setValue ( key: string , value: string , onComplete: () => any ) {
        if ( this.useChrome) {
            let p: any = {} ; 
            p[key] = value ; 
            this.chromeRef.storage.local.set(p , function () {
                onComplete(); 
            } ); 
        } else {
            localStorage.setItem(key , value) ; 
            onComplete()  ; 
        }
    }

    /**
     * set item. ini dengan Promise 
     * @param key key dari untuk menaruh data
     * @param value value untuk di taruh dalam data
     */
    setItem(key: string, value: string): Promise<any> {
        return new Promise<any>((accept: (n: any ) => any , reject: ( exc: any ) => any  ) => {
            if (this.useChrome) {
                let p: any = {};
                p[key] = value;
                this.chromeRef.storage.local.set(p, function () {
                    accept({});
                });
            } else {
                localStorage.setItem(key, value);
                accept({});
            }
        }); 
    }

    /**
     * membaca item dari local storage/chrome storage
     * @param key key untuk membaca data
     */
    getItem(key: string): Promise<string> {
        return new Promise<any>((accept: (n: any) => any, reject: (exc: any) => any) => {
            if (this.useChrome) {
                let p: any = {};
                this.chromeRef.storage.local.get(p,  (d: any) => {
                    accept(d);
                });
            } else {
                accept(localStorage.getItem(key));
            }
        });

    }

    /**
     * hapus item dari local storage/chrome storage
     * kalau paramater  <i>onComplete</i> null maka akan di return <strong>Promise</strong>
     * @param key key untuk di hapus
     * @param callback callback kalau delete local storage item complete
     */
    removeItem(key: string, onComplete?: () => any): any | Promise<any> {
        if (onComplete != null && typeof onComplete !== 'undefined') {
            if (this.useChrome) {
                let p: any = {};

                this.chromeRef.storage.local.removeItem(p, function () {
                    onComplete();
                });
            } else {
                localStorage.removeItem(key);
                onComplete();
            }
        } else {
            return new Promise<any>(( accept: (n: any ) => any , reject: (exc: any ) => any ) => {
                if (this.useChrome) {
                    let p: any = {};

                    this.chromeRef.storage.local.removeItem(p, function () {
                        accept({});
                    });
                } else {
                    localStorage.removeItem(key);
                    accept({});
                }
            }); 
        }
         
    } 
    
    /**
     * membaca data dari chrome
     */
    getValue ( key: string , onReadComplete: ( val: string ) => any ) {
        if ( this.useChrome) {
            this.chromeRef.storage.local.get(key , function (val: string) {
                onReadComplete(val) ; 
            });
        } else {
            let v: string =  localStorage.getItem(key)! ;  
            onReadComplete(v)  ;
        }
    }
    
}