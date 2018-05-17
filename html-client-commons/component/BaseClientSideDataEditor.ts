"use strict" ;
import { BaseEditorPanel } from "./BaseEditorPanel"; 
import { ajaxhelper } from "../utils/ajaxhelper" ;
import { EditorSubcomponentInterface } from "./EditorComponentData";
import { editorsupport } from "./editor/editorsupport";

/**
 * base class untuk editor di sisi client. editor ini ada akses ke client side data container
 */
export abstract class BaseClientSideDataEditor<DATA> extends BaseEditorPanel<DATA> {
    /**
     * flag lookup sudah di request atau tidak
     */
    lovRequested: boolean ;
    /**
     * data yang sedang di edit
     */
    currentEditedData: DATA ;
    /**
     * container data tambahan
     */
    additionalDataContainer: {[id: string ]: any }; 
    /**
     * untuk akses ke server
     */
    ajaxUtils: ajaxhelper.AjaxUtils ;
    closeCommand: () => any ;

    afterEditTask: (data: DATA ) => any ;
    /**
     * berapa kali sudah di coba configure form.>20 x menyerah
     */
    retryFormConfigCount: number ;

    private _editorState: string ;
    constructor( ) {
        super(); 
        this.ajaxUtils = ajaxhelper.generateOrGetAjaxUtils() ;
        let blank: any = {} ;
        this.currentEditedData = blank ;
        this.lovRequested = false ;
        this.additionalDataContainer = {} ; 
    }
    defaultFormSubmitHandler: () => any = () => {
        if ( this._editorState === "ADD") {
            this.submitAdd(this.currentEditedData , this.closeCommand , this.afterEditTask ) ;
        } else if ( this._editorState === "EDIT") {
            this.submitEdit(this.currentEditedData , this.closeCommand , this.afterEditTask ) ;
        } else if ( this._editorState === "DELETE") {
            this.submitDelete(this.currentEditedData , this.closeCommand , this.afterEditTask ) ;
        }
    }
    
    close() {
        this.closeCommand();
    }

    submitAdd ( addedData: DATA  ,  closeCommand: () => any , afterEditTask: (data: DATA ) => any ) {
        this.getDataContainer().appendNewData(addedData) ;
        closeCommand() ;
        afterEditTask(addedData)  ;
    }
    submitEdit( editedData: DATA ,  closeCommand: () => any , afterEditTask: (data: DATA ) => any ) {
        this.getDataContainer().editData(editedData) ;
        closeCommand() ;
        afterEditTask(editedData)  ;
    }
    submitDelete( deletedData: DATA ,  closeCommand: () => any , afterEditTask: (data: DATA ) => any ) {
        this.getDataContainer().deleteData(deletedData) ;
        closeCommand() ;
        afterEditTask(deletedData)  ;
    }
    additionalTaskOnAdd (data: DATA) {
        //
    }
    additionalTaskOnEdit (data: DATA) {
        //
    }
    additionalTaskOnDelete (data: DATA) {
        //
    }
    additionalTaskOnView (data: DATA) {
        //
    }
    /**
     * implementasi custom untuk register. misal kalau sudah ada data, maka data akan di assign ke dalam control
     */
    additionalTaskOnRegister (childEditor: EditorSubcomponentInterface<DATA>) {
        childEditor.assignData(this.currentEditedData , this._editorState , this.additionalDataContainer) ;
    }
    /**
     * task pada saat panel di unreg
     */
    additionalTaskOnUnRegister(childEditor: EditorSubcomponentInterface<DATA>) {
        //
    }

    submitLookupRequest( nextTask: () => any ) {
        // FIXME: ini tidak bisa di pakai 
        nextTask() ; 
        /*
        let frm : EditorForm =  this.getEditorForm() ;
        let ids : string [] =  frm.lookupManager.getLookupIds() || null;
        if   (ids == null || ids.length === 0) {
            nextTask() ;
            return ;
        }
        frm.lookupManager.requestLookupData({
            modelName : null ,
            onLookupAccepted : () => {
                nextTask();
            }
        });*/
    }

    addNewData (data: DATA , closeCommand: () => any  , afterEditTask: (data: DATA ) => any) {
        if ( !this.lovRequested) {
            this.lovRequested = true ;
            this.submitLookupRequest(() => {
                this.addNewData(data, closeCommand , afterEditTask);
            });
            return ;
        }
        this.additionalDataContainer = {} ; 
        this.additionalTaskOnAdd(data);
        this._editorState = "ADD";
        this.currentEditedData = data ;
        this.closeCommand = closeCommand ;
        this.afterEditTask = afterEditTask ;
    }

    editData (data: DATA  , closeCommand: () => any, afterEditTask: (data: DATA ) => any) {
        if ( !this.lovRequested) {
            this.lovRequested = true ;
            this.submitLookupRequest(() => {
                this.editData(data, closeCommand , afterEditTask);
            });
            return ;
        }
        this.additionalDataContainer = {} ; 
        this.additionalTaskOnEdit(data);
        this._editorState = "EDIT";
        this.currentEditedData = data ;
        this.closeCommand = closeCommand ;
        this.afterEditTask = afterEditTask ;
    }
    viewDataDetail (data: DATA  , closeCommand: () => any) {
        if ( !this.lovRequested) {
            this.lovRequested = true ;
            this.submitLookupRequest(() => {
                this.viewDataDetail(data, closeCommand  );
            }) ;
            return ;
        }
        this.additionalDataContainer = {} ; 
        this.additionalTaskOnView(data);
        this._editorState = "VIEW";
        this.currentEditedData = data ;
        this.closeCommand = closeCommand ;
    }

    deleteDataConfirmation (data: DATA , closeCommand: () => any, afterEditTask: (data: DATA ) => any) {
        if ( !this.lovRequested) {
            this.lovRequested = true ;
            this.submitLookupRequest(() => {
                this.deleteDataConfirmation(data, closeCommand , afterEditTask);
            }) ;
            return ;
        }
        this.additionalDataContainer = {} ; 
        this.additionalTaskOnDelete(data);
        this._editorState = "DELETE";
        this.currentEditedData = data ;
        this.closeCommand = closeCommand ;
        this.afterEditTask = afterEditTask ;
    }
    /**
     * akses ke data container
     */
    abstract getDataContainer():  editorsupport.ClientSideEditorContainer<DATA> ;
}