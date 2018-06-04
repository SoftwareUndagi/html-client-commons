import { BaseEditorPanel , } from "./BaseEditorPanel"; 
import { ajaxhelper } from "../utils/ajaxhelper" ;
import { EditorSubcomponentInterface } from "./EditorComponentData";
import { CommonsAjaxResultHolder } from "./EditorComponentData"; 
import { CloseEditorCommand , EditingDataCompleteHandler , AdditionalEditorTask } from "./EditorComponentData";  
import { CommonCommunicationData } from 'core-client-commons/index' ;
 /**
  * base class untuk base DB driven editor.
  * agak sedikit menyusahkan, karena pada base class @Input tidak akan bekerja. sehingga item ini mau tidak mau harus di pasang pada class implementasi pada level implementasi.
  * berikut ini pekerjaan-pekerjaan dalam implementasi dari panel
  * <ol>
  * <li>dalam template , anda perlu mengeset id dari panel dengan {{panelId}}, id panel di set increment. ini di pergunakan agar code bisa memblock editor(via id dari element)<br/>
  * Kalau misal anda perlu mengeset id panel , pergunakan @Input , dan set variable <i>panelId</i> dalam onNgInit</li>
  * <li>editingModeEnabled di pergunakan enable/disbale tombol dan item yang lain yang perlu di disabled pada saat simpan. contoh nya seperti ini [disabled]="editingModeEnabled"</li>
  * <li></li>
  * </ol>
  *
  *
  */
export abstract class BaseDBDrivenEditor <ID  , DATA   >  extends BaseEditorPanel<DATA> {

    static PANEL_ID_COUNTER: number = new Date().getTime() ;
    /**
     * read data result. bagaimana hasil pembacaan terakhir
     */
    readDataResult: CommonsAjaxResultHolder ;

    /**
     * hasil simpan data. either ADD, UPDATE, DELETE
     */
    saveDataResult:  CommonsAjaxResultHolder ;
    /**
     * ID dari data yang di edit
     */
    _editedDataId: ID ;

    /**
     * data yang di edit
     */
    currentEditedData: DATA ;
    /**
     * token untuk proses edit
     */
    editorDataToken: string ;
    /**
     * ini di pergunakan untuk enable / disable tombol . misal dalam proses save, load LOV,
     * pastikan di dalam template anda menyertakan enable/disabled sesuai dengan button
     */
    editingModeEnabled: boolean ;
    /**
     * flag LOV sudah di request atau tidak
     */
    lovRequested: boolean  ;

    /**
     * model sequelize yang di akses
     */
    modelName: string ;
    /**
     * ID dari panel. pergunakan ini untuk bagian paling luar. seperti ini : &lt;div id="{{panelId}}"
     */
    panelId: string ;
    /**
     * helper ajax
     */
    ajaxUtils: ajaxhelper.AjaxUtils ;
    /**
     * commmand untuk close panel
     */
    closeCommand: CloseEditorCommand ;
    /**
     * handler dalam kasus data not found. kasus edit
     */
    dataNotFoundOnEditHandler: (notFoundFlag: boolean ) => any ;

    /**
     * handler data not found. kasus konfirmasi delete
     */
    dataNotFoundOnDeleteHandler: (notFoundFlag: boolean ) => any ;
    /**
     * handler data not found. dalam kasus view
     */
    dataNotFoundOnViewHandler: (notFoundFlag: boolean ) => any ;
    /**
     * actual handler untuk proses read data failed
     */
    onReadDataFailed: (code: string , message: string , actualException: any ) => any ;
    /**
     * handler setelah edit selesai
     */
    editingDoneHandler: EditingDataCompleteHandler<DATA>;
    /**
     * container data tambahan
     */
    additionalDataContainer: {[id: string ]: any }; 
    /**
     * task tambahan dalam proses edit. default di isi dengan additionalTaskOnedit
     */
    private _additionalEditTask: AdditionalEditorTask<DATA>[] ;

    /**
     * state dari editor <ol>
     * <li>ADD</li>
     * <li>EDIT</li>
     * <li>DELETE</li>
     * <li>NONE</li>
     * </ol>
     */
    private _editorState: string ;
    /**
     * task tambahan dalam proses add. default di isi dengan additionalTaskOnAdd
     */
    private _additionalAddTask: AdditionalEditorTask<DATA>[] ;
    /**
     * task tambahan dalam proses add. default di isi dengan additionalTaskOnErase
     */
    private _additionalEraseTask: AdditionalEditorTask<DATA>[] ;

    /**
     * task on view
     */
    private _additionalViewTask: AdditionalEditorTask<DATA>[] ;
    /**
     * @param http di inject oleh angular
     * @param modelName nama model yang akan di edit oleh editor
     */
    constructor(  ajaxUtils: ajaxhelper.AjaxUtils , modelName: string ) {
        super(); 
        this.additionalDataContainer = {} ; 
        this.ajaxUtils = ajaxUtils ;
        this.modelName = modelName ;
        let n: any = {} ;
        this.currentEditedData = n  ;
        this.readDataResult  =  {haveError : false }   ;
        this.saveDataResult = {haveError : false}  ;
        this._editorState =  "NONE" ;

        let swapThis: BaseDBDrivenEditor <ID  , DATA   >   = this ;

        this._additionalAddTask = []  ;
        this._additionalEditTask = []  ;
        this._additionalEraseTask = []  ;
        this._additionalViewTask = []  ;

        this._additionalAddTask.push(a => {
            this.additionalDataContainer = {} ;
            if ( swapThis.childEditors.length > 0) {
                for ( var chld of swapThis.childEditors) {
                    chld.assignData(a , "ADD" , this.additionalDataContainer); 
                }
            }
            swapThis.additionalTaskOnAdd(a) ;
        });
        this._additionalEditTask .push( data => {
            this.additionalDataContainer = {} ;
            if ( swapThis.childEditors.length > 0) {
                for ( var chld of swapThis.childEditors) {
                    chld.assignData(data , "EDIT"  , this.additionalDataContainer); 
                }
            }
            swapThis.additionalTaskOnedit(data) ;
        });
        this._additionalEraseTask.push(data => {
            this.additionalDataContainer = {} ;
            if ( swapThis.childEditors.length > 0) {
                for ( var chld of swapThis.childEditors) {
                    chld.assignData(data , "DELETE" ,  this.additionalDataContainer); 
                }
            }
            swapThis.additionalTaskOnErase(data) ;
        }) ;
        this._additionalViewTask.push(data => {
            this.additionalDataContainer = {} ;
            if ( swapThis.childEditors.length > 0) {
                for ( var chld of swapThis.childEditors) {
                    chld.assignData(data , "VIEW" ,  this.additionalDataContainer); 
                }
            }
            swapThis.additionalTaskOnView(data) ;
        }) ;
        this.panelId = "db_driven_editor" + BaseDBDrivenEditor.PANEL_ID_COUNTER ;
        BaseDBDrivenEditor.PANEL_ID_COUNTER =  BaseDBDrivenEditor.PANEL_ID_COUNTER + 1 ;
        this.lovRequested = false ;
        let swap: any = {} ;
        this.currentEditedData = swap ;

        this.dataNotFoundOnDeleteHandler = () => { 
            //
        };
        this.dataNotFoundOnEditHandler = () => { 
            //
        };
        this.dataNotFoundOnViewHandler = () => { 
            //
        };
        this.onReadDataFailed = () => { 
            //
        };
    }
    onInitTask () {
        console.log("class anda mempergunakan default additionalalInitTask, yang mana tidak ada pekerjaan sama sekali. override ini kalau anda memerlukan task tertentu");
    }
    
    /**
     * implementasi custom untuk register. misal kalau sudah ada data, maka data akan di assign ke dalam control
     */
    additionalTaskOnRegister (childEditor: EditorSubcomponentInterface<DATA>) {
        childEditor.assignData(this.currentEditedData , this._editorState, this.additionalDataContainer) ;
    }
    
    /**
     * task pada saat panel di unreg
     */
    additionalTaskOnUnRegister(childEditor: EditorSubcomponentInterface<DATA>) {
        //
    }
    /**
     * task tambahan untuk edit. override ini kalau di perlukan
     */
    additionalTaskOnedit (data: DATA) {
        console.log("additionalTaskOnedit tidak melakukan apapun.override jika di perlukan");
    }
    /**
     * task tambahan pada saat view data
     * @param data data untuk di view
     */
    additionalTaskOnView (data: DATA) {
        console.log("additionalTaskOnView tidak melakukan apapun.override jika di perlukan");
    }
    /**
     * task tambahan on dalam proses add
     * @param data data baru
     */
    additionalTaskOnAdd (data: DATA) {
        console.log("additionalTaskOnAdd tidak melakukan apapun.override jika di perlukan");
    }

    /**
     * task untuk hapus
     * @param data data untuk di hapus
     */
    additionalTaskOnErase (data: DATA) {
        console.log("additionalTaskOnErase tidak melakukan apapun.override jika di perlukan");
    }
    /**
     * tutup editor. gunakan ini untuk tombol tutup
     */
    close() {
        this.closeCommand() ;
    }
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
    /**
     * reset save data result
     */
    clearSaveResult() {
        this.saveDataResult = this.saveDataResult || {haveError: false} ;
        this.saveDataResult.erorrCode = null! ;
        this.saveDataResult.errorMessage = "";
        this.saveDataResult.haveError = false ;
    }

    /**
     * worker untuk kofirmasi delete
     */
    deleteConfirmation ( id: ID , closeCommand: CloseEditorCommand ,  deleteDoneHandler: EditingDataCompleteHandler<DATA>) {
        this.clearSaveResult();
        this._editorState = "DELETE";
        this._editedDataId = id ;
        this.closeCommand = closeCommand ;
        this.requestDataForEdit(id , this._additionalEraseTask , this.dataNotFoundOnDeleteHandler) ;
        this.editingDoneHandler = deleteDoneHandler;
    }
    /**
     * worker untuk edit.
     * ini akan otomatis request data + lookkup
     */
    editData (id: ID, closeCommand: CloseEditorCommand , editDoneHandler: EditingDataCompleteHandler<DATA>) {
        this.clearSaveResult();
        this._editorState = "EDIT";
        this._editedDataId = id ;
        this.requestDataForEdit(id , this._additionalEditTask , this.dataNotFoundOnEditHandler) ;
        this.closeCommand = closeCommand  ;
        this.editingDoneHandler = editDoneHandler ;
        // FIXME: cari lookups
    }
    /**
     * view data detail
     * @param id id dari data untuk di view
     * @param closeCommand comman untuk close panel. bagaimana cara hide panel
     * @param onDataLoadedTask handler kalau data sudah di load. lakukan yang di perlukan untuk handler task berikut
     */
    viewData(id: ID, closeCommand: CloseEditorCommand , onDataLoadedTask ?: (data: DATA) => any  ) {

        this._editorState = "VIEW";
        this._editedDataId = id ;
        let actualParamArrayTask: AdditionalEditorTask<DATA>[] = this._additionalViewTask ;
        if ( onDataLoadedTask != null && typeof  onDataLoadedTask !== "undefined") {
            if ( actualParamArrayTask == null || typeof actualParamArrayTask === "undefined") {
                actualParamArrayTask = [onDataLoadedTask];
            } else {
                actualParamArrayTask = [onDataLoadedTask];
                for ( var x of this._additionalViewTask) {
                    actualParamArrayTask.push(x);
                }
            }
        }
        this.requestDataForEdit(id , actualParamArrayTask , this.dataNotFoundOnViewHandler) ;
        this.closeCommand = closeCommand  ;
    }
    /**
     * worker untuk add new data. pergunakan hanya ini untuk add new data
     */
    addNewData (newData: DATA , closeCommand: CloseEditorCommand ,  addDoneHandler: EditingDataCompleteHandler<DATA>) {
        /*this.editingModeEnabled = false ;
        this.closeCommand = closeCommand  ;
        this._editorState = "ADD" ;
        this.editingDoneHandler = addDoneHandler ;
        let frm : EditorForm = this.getEditorForm() || null ;
        
        let propagateAddNewData : ( data : DATA ) => any = ( data : DATA )=>{
            for ( var addHdlr of this._additionalAddTask ) {
                addHdlr(data) ;
            }
        }
        if ( frm == null ) {
            console.log("[BaseDBDrivenEditor]Anda tidak menyertakan form editor, lookup tidak akan di bind") ;
            this.currentEditedData = newData ;
            propagateAddNewData(newData) ;
        }else {// form null
            let ids: string[] =  frm.lookupManager.getLookupIds() || null  ;
            if ( this.lovRequested) {
                this.requestEditDataToken( (token : string) => {
                    this.currentEditedData = newData ;
                    this.editingModeEnabled = true;
                    propagateAddNewData(newData) ;
                } , ( code : string , message : string ,   ex : any ) => {
                    alert("Gagal request token. add data tidak akan di mungkinkan, error : " + message ) ;
                    this.close() ;
                });

                console.log("[BaseDBDrivenEditor] editingModeEnabled --> true ") ;
            }else {// else (!  this.lovRequested

                this.lovRequested = true ;
                if ( frm.lookupManager.getLookupIds().length > 0 ) {
                    frm.lookupManager.requestLookupData({
                        dataIdAsString : null ,
                        modelName : this.modelName ,
                        onTokenAccepted : (token : string ) => {
                            this.editorDataToken  = token   ;
                        } ,
                        onLookupAccepted : (lookups ) => {
                            this.currentEditedData = newData ;
                            this.editingModeEnabled = true;
                            propagateAddNewData(newData) ;
                            console.log("[BaseDBDrivenEditor] editingModeEnabled --> true ") ;
                        }
                    })  ;
                }   else {
                    this.requestEditDataToken( (token : string ) => {
                        this.currentEditedData = newData ;
                            this.editingModeEnabled = true;
                            propagateAddNewData(newData) ;
                    } , ( code : string , message : string ,   ex : any ) => {
                        alert("Gagal request token. add data tidak akan di mungkinkan, error : " + message ) ;
                        this.close() ;
                    });
                }

            }
        }*/
    }
    /**
     * request token edit dari server. kalau erorr code bukan
     */
    requestEditDataToken ( onSuccess: (token: string ) => any , onFailure: (code: string , message: string , actualException: any ) => any  ) {
        let self: BaseDBDrivenEditor< ID , DATA   >  = this ;
        let url: string  = "/dynamics/rest-api/generic/" + this.modelName + "/double-submit-token-generator.svc" ;
        self.ajaxUtils.sendAjaxGet(
            url  , a => {
                let tkn: any = a ;
                self.editorDataToken = tkn ;
                onSuccess(tkn);
            } ,
            onFailure) ;
    }
    /**
     * model yang di include pada saat read. override ini kalau memang memerlukan field tambahan
     */
    getIncludeModels (): CommonCommunicationData.IncludeModelParam[] {
        return null! ;
    }

    /**
     * generate get data url. ini sudah harus menyertakan minimall 1 parameter, agar penambahan parameter menjadi sederhana
     * @param modelName nama model yang perlu di baca
     * @param dataId id dari data yang perlu di baca
     */
    generateGetDataUrl(modelName: string, dataId: ID): string {
        return "/dynamics/rest-api/generic-edit/" + modelName + "/" + dataId + "?thisFramework=rocksolid";
    }

    /**
     * request data untuk edit
     */
    private requestDataForEdit(dataID: ID, additionalEditTasks: AdditionalEditorTask<DATA>[], onDataNotFoundHandler: (notFoundFlag: boolean) => any) {
        /*
        let errorHandler : ( errorCode : string , errorMessage : string , exc : any ) => any = ( errorCode : string , errorMessage : string , exc : any ) => {
                    console.error("[DbDrivenEditorData] gagal membaca editor untuk pojo [" + this.modelName + "], error : " + errorCode + ", message : " + errorMessage);
                    let empty : any = {} ;
                    this.currentEditedData = empty  ;
                    if ( additionalEditTasks != null) {
                        for ( var tsk of additionalEditTasks){
                            tsk(null);
                        }
                    }
                    onDataNotFoundHandler(true);

                    return ;
            };

        //                  /dynamics/rest-api/generic-edit/
        let url: string = this.generateGetDataUrl(this.modelName, dataID);
        let incs :  CommonCommunicationData.IncludeModelParam[] = this.getIncludeModels() || null  ;
        if ( incs != null  && incs.length > 0) {
            url += "&includedModels=" +  btoa(JSON.stringify(incs));
        }
        if ( this.EditorState === "VIEW") {
                url = url + "&includeToken=N";
        }
        this.editingModeEnabled = false ;
        let noLovReqFunction : () => any = () => {

            this.ajaxUtils.sendAjaxGet(url  , ( a : CommonCommunicationData.EditDataWrapper<DATA>) => {
                if ( a == null ) {
                    onDataNotFoundHandler(true ) ;
                }else {
                    onDataNotFoundHandler(false ) ;
                }
                this.editorDataToken = a.editDataToken ;

                this.currentEditedData = a.editedData ;
                this.editingModeEnabled = true ;

                for ( var xxEdit of additionalEditTasks){
                    xxEdit(a.editedData);
                }
            } , errorHandler) ;
        };
        if ( this.lovRequested || this.getEditorForm().lookupManager.getLookupIds().length === 0 ) { // kalau lookup sudah di request
            console.log("[DbDrivenEditorData] lovRequested :  " , this.lovRequested , " lookup size : " ,
                this.getEditorForm().lookupManager.getLookupIds().length , ".edit tanpa data lookup di kirim ke server") ;
                noLovReqFunction() ;

        }else {
            this.lovRequested = true ;

            this.getEditorForm().lookupManager.loadFromCacheAndGenerateLookupRequest(
                ( lookupReqs : CommonCommunicationData.LookupRequestData[] ) => {
                lookupReqs = lookupReqs || null ;
                if ( lookupReqs == null || lookupReqs.length === 0) {
                    noLovReqFunction();
                    return ;
                }
                url = url + "&lookupFields=" + btoa(JSON.stringify(lookupReqs));
                console.log("[DbDrivenEditorData] lookup size : ",  this.getEditorForm().lookupManager.getLookupIds().length ,
                    ".ke server di request dengan params : " , lookupReqs);
                this.ajaxUtils.sendAjaxGet(url  , ( a : CommonCommunicationData.EditDataWrapper<DATA>) => {

                    this.editorDataToken = a.editDataToken ;

                    this.editingModeEnabled = true ;
                    let lookups : CommonCommunicationData.LookupRequestResultWrapper[] =  a.lookups  ;
                    this.getEditorForm().lookupManager.processLookupRequestResult(lookups);
                    this.currentEditedData = a.editedData ;
                    for ( var xxEdit of additionalEditTasks){
                        xxEdit(a.editedData);
                    }
                } , errorHandler) ;
            });
        }*/
    }

}