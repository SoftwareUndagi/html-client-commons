
"use strict" ;
import { BaseEditorPanel } from "./BaseEditorPanel"; 
import { ajaxhelper } from "../utils/ajaxhelper" ;
import { EditorSubcomponentInterface } from "./EditorComponentData";
/**
 * sub editor component. 
 * yang agak sulit adalah memp-pass reference parent ke dalam child. tidak terlalu banyak pilihan . anda perlu mem-pass CoreComponentDirective.EditorForm
 * 
 */
export abstract class EditorSubComponent<DATA> implements EditorSubcomponentInterface<DATA> {
    /**
     * ajax utils.untuk akses ke network
     */
    ajaxUtils: ajaxhelper.AjaxUtils; 
    /**
     * data yang dalam mode edit
     */
    currentEditedData: DATA ; 
    /**
     * penampung data tambahan. kalau misal data di edit tidak bisa di muat dalam variable currentEditedData. 
     * pertimbangan nya misalnya akan merusak struktur data
     */
    additionalDataContainer: {[id: string]: any } ; 
    /**
     * state dari editor
     */
    private _editorState: string ;
    /**
     * berapa kali attemp register ke parent 
     */
    private _registerToParentAttemtCount: number ; 
    /**
     * @param ajaxUtils akses ke ajax util . untuk akses ke network
     */
    constructor(ajaxUtils: ajaxhelper.AjaxUtils) {
        let swap: any = {} ; 
        this.currentEditedData =  swap ;
        this._editorState = "NONE" ;  
        this.ajaxUtils = ajaxUtils  ;
    } 
        
    /**
     * assign data ke dalam sub editor
     * @param additionalDataContainer penampung data pada sub. kalau misal data tidak bisa di muat pada dat autama, maka akan di masukan dalam hash map
     */
    assignData (data: DATA  , editorState: string  , additionalDataContainer: {[id: string]: any } ) {
        this.currentEditedData = data ; 
        this._editorState = editorState ; 
        this.additionalTaskOnDataAssigned(data, editorState , additionalDataContainer) ; 
        this.additionalDataContainer = additionalDataContainer; 
        console.log("[EditorSubComponent] data di terima dari parent : " , data, ",editor mode : " , editorState); 
    }
         
    /**
     * task tambahan pada saat di assign 
     */
    abstract additionalTaskOnDataAssigned(data: DATA  , editorState: string , additionalDataContainer: {[id: string]: any }) ;   
         
        /**
         * property getter. state dari editor
         */
        get EditorState (): string {
            return this._editorState ;
        }
        /**
         * setter editor state
         */
        set EditorState(state: string )  {
            this._editorState = state ;
        }
        
        onInitTask () {
             //
        }
         
         /**
          * worker untuk register to parent. di attemp 10 x delay 500 52
          */
         private runRegisterToParent () {
             let allObjKeys: string[] = Object.keys(this) ;
             let anyFound: boolean = false ;  
             for ( var f of allObjKeys) {
                 if ( typeof this[f] === "function") {
                     if ( this[f][BaseEditorPanel.MARKER_REGISTER_CHILD_EDITOR] === BaseEditorPanel.MARKER_REGISTER_CHILD_EDITOR_VALUE ) {
                         this[f](this); 
                         anyFound = true ; 
                         console.log(`[EditorSubComponent] ok, sub editor match ..`); 
                         break ; 
                     }
                 }
             }
             if ( !anyFound) {
                 if ( this._registerToParentAttemtCount < 5) {
                    setTimeout( 
                        () => {
                            this.runRegisterToParent(); 
                        } , 
                        500); 
                    return ; 
                 }
                 console.log(`[EditorSubComponent] maaf, anda tidak mengirimkan variable : registerChildEditor ke dalam sub editor. 
                 dalam file .ts : 
                 @Input() registerChildEditor : (subEditor : EditorSubComponent ) => any 
                 dalam file .html 
                 <some-sub-editor [registerChildEditor]="registerChildEditor"></some-sub-editor>
                 hal ini tidak bisa di automate dalam base class. silakan di cek kembali
                 ` );
             }
         }
         
    }