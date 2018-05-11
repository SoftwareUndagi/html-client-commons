import { EditorSubcomponentInterface } from "./EditorComponentData";
/**
 * base class utnuk base editor. baik db driven atau pun client side
 */
export abstract class BaseEditorPanel <DATA> {
    
    /**
     * penanda marker register child editor
     */
    static MARKER_REGISTER_CHILD_EDITOR = "registerChildEditor";
    
    /**
     * penanda marker register child editor unregister editor .
     */
    static MARKER_UNREGISTER_CHILD_EDITOR = "unRegisterChildEditor"; 
    
    static MARKER_REGISTER_CHILD_EDITOR_VALUE = "gps.corp.register";
    /**
     * marker unreg child panel
     */
    static MARKER_UNREGISTER_CHILD_EDITOR_VALUE = "gps.corp.register";
    /**
     * child editor dari form
     */
    childEditors: EditorSubcomponentInterface<DATA> [] ; 
    /**
     * method untuk register child editor method
     * ini untuk di pass ke child component. agar child component ter register ke parent
     */
    registerChildEditor: (childEditor: EditorSubcomponentInterface<DATA> ) => any ;
    
    /**
     * method untuk unreg child editor. kalau memang di perlukan 
     */
    unRegisterChildEditor: (childEditor: EditorSubcomponentInterface<DATA> ) => any ;
    /**
     * worker untuk register child variable. ini untuk di pergunakan register variable tanpa @ViewChild
     * syaratnya child element memang bisa meregister dirinya sendiri
     */
    registerVariableMethod: (variableName: string , variable: any ) => any ;
    /**
     * ini lawan dari #registerVariableMethod, ini di pergunakan untuk me-null kan variable. kalau misal nya child element di destroy
     */
    unRegisterVariableMethod: (variableName: string ) => any ;
     
    constructor() {
        this.childEditors = [] ; 
        let self: any = this ; 
        this.registerChildEditor =  (childEditor: EditorSubcomponentInterface<DATA> ) => {
            if ( self.childEditors.indexOf(childEditor) === -1) {
                console.log("Child di register ..");    
                self.childEditors.push(childEditor);
                self.additionalTaskOnRegister(childEditor);  
            }
        };
        this.unRegisterChildEditor = (childEditor: EditorSubcomponentInterface<DATA> ) => {
            let idx: number = self.childEditors.indexOf(childEditor) ;  
            if ( idx !== -1) {
                self.childEditors.splice(idx , 1 ) ;
                this.additionalTaskOnUnRegister(childEditor);  
            }
        };
        
        this.registerChildEditor[BaseEditorPanel.MARKER_REGISTER_CHILD_EDITOR] = BaseEditorPanel.MARKER_REGISTER_CHILD_EDITOR_VALUE ;
        this.registerVariableMethod =  (variableName: string , variable: any ) => {
            this[variableName] = variable ; 
        };
        this.unRegisterVariableMethod = (variableName: string) => {
            this[variableName] = null ;
        };
    }
    
    /**
     * implementasi custom untuk register. misal kalau sudah ada data, maka data akan di assign ke dalam control
     */
    abstract additionalTaskOnRegister (childEditor: EditorSubcomponentInterface<DATA>): void ; 
    /**
     * task tambahan pada saat panel di detach
     */
    abstract additionalTaskOnUnRegister (childEditor: EditorSubcomponentInterface<DATA>): void ;
    
}