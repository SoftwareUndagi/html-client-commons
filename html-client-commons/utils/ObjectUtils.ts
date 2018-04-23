
import { ObjectUtils as Ob } from 'core-client-commons/index'; 
/**
 * object utils. untuk maipulasi object , constructor dlll
 */
export class ObjectUtils extends Ob {
    
    /**
     * mecari constructor object dari path yang di minta
     */
    static findConstructor (path: string ): any  {
        let d: any = window ; 
        let pths: string[] = path.split(".") ; 
        for ( var p of pths) {
            d = d[p] ; 
            if ( d == null || typeof d === "undefined") {
                return null ;
            }
        }
        return d ; 
    }
} 