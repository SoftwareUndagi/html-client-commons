
import { CommonClientData , SecurityData  } from 'core-client-commons/index';
/**
 * data untu routing
 */
export interface RouteData {
    /**
     * unit of work dari current user
     */
    unitOfWork: SecurityData.UnitOfWork ; 
    /**
     * route path yang sedang di handle
     */
    routePath: string   ; 
    /**
     * privilage dari current user
     */
    userPrivilage: CommonClientData.UserPrivilage  ;   
    /**
     * lebar yang tersedia
     */
    availableWidth: number   ; 
    /**
     * tinggi yang tersedia. ini untuk menghindari component mengecek window height
     */
    currentWindowHeight: number ; 
    /**
     * username yang sedang di pakai
     */
    user: SecurityData.UserLoginData ; 
}