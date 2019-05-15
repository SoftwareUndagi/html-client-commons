
import { UnitOfWork  } from 'base-commons-module' ; 
import { UserPrivilage, UserLoginData } from 'core-client-commons'
/**
 * data untu routing
 */
export interface RouteData {
    /**
     * unit of work dari current user
     */
    unitOfWork:  UnitOfWork ; 
    /**
     * route path yang sedang di handle
     */
    routePath: string   ; 
    /**
     * privilage dari current user
     */
    userPrivilage: UserPrivilage  ;   
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
    user: UserLoginData ; 
}