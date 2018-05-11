import { CommonCommunicationData , isNull, setValueHelper , EditorInputElement , ListOfValueManager  } from 'core-client-commons';
import { Select2PanelProps  } from '../../Select2Panel';
import { BaseHtmlComponent } from "../../BaseHtmlComponent";

export interface EditorSelect2MultipleProps extends Select2PanelProps {
    /**
     * id select control
     */
    selectId?: string; 

    /**
     * tab index. ini agar elemen bisa di focus
     */
    tabIndex ?: number; 

    /**
     * label untuk versi readonly
     */
    noneSelectedLabel?: string; 

    /**
     * hint untuk kasus none selected
     */
    noneSelectedTitle?: string; 

    /**
     * nama field tempat menaruh variable
     */
    fieldName: string  ; 
    /**
     * kalau di masukan true , pada bagian label akan keluar silakan pilih terus. ini berguna kalau di pergunakan dalam select2 dengan multiple item
     */
    doNoRenderSelectedLabel ?: boolean ; 
    /**
     * offset berapa drop down di kurangi atau tambahi. ini di gunakan untuk multiple select
     */
    dropDownTopOffset ?: number ; 
    /**
     * filter data
     */
    dataFilter?: (data: CommonCommunicationData.CommonLookupValue) => boolean; 
    /**
     * formatter label. unutk di render dalam select2
     */
    labelFormatter?: (data: CommonCommunicationData.CommonLookupValue ) => string; 

    /**
     * kode lookup
     */
    initialData?: CommonCommunicationData.CommonLookupValue[]; 

    /**
     * handler value change
     */
    changeHandler?: ( val: string ) => any ;

    /**
     * change handler dengan data lookup
     */
    changeHandlerWithLookup ?: (val: CommonCommunicationData.CommonLookupValue) => any ;   
    /**
     * extract data dari selected data.item yang di pilih. default akan di read dari detailCode
     */
    selectedDataValueExtractor ?: (val: CommonCommunicationData.CommonLookupValue ) => string |number|Date; 
    /**
     * parameter untuk lookup data. kalau select2 mengandalkan data dari select2
     */
    lookupParameter ?: {
        /**
         * id dari lookup. ini untuk di request kembali ke server
         */
        lovId: string; 

        /**
         * managaer lookup 
         */
        lookupManager: ListOfValueManager ; 
    };
    /**
     * initial value
     */
    initialValue ?: string; 
    /**
     * filter dengan query. ini kalau perlu filter khusus
     */
    queryDataFilter?: (query: string, data: CommonCommunicationData.CommonLookupValue) => boolean;

    /**
     * title . hint pada saat di mouse hover
     */
    titleFormatter?: (data: CommonCommunicationData.CommonLookupValue) => string; 
    /**
     * modificator data. kalau memerlukan modifikasi data dari lookup. misal : mengatur urutan dari data. mengatur level dari data(untuk presentasi tree)
     */
    lookupDataTransformator ?: ( lookups: CommonCommunicationData.CommonLookupValue[] ) => CommonCommunicationData.CommonLookupValue[] ; 
}

export interface EditorSelect2MultipleState {
    /**
     * flag expand collapse flag
     */
    expanded?: boolean; 

    /**
     * data yang di pilih
     */
    selectedData?: CommonCommunicationData.CommonLookupValue[]; 

    /**
     * kode lookup
     */
    data?: CommonCommunicationData.CommonLookupValue[]; 

    /**
     * ini untuk memflag baru saja click
     */
    justClearSelection?: boolean; 

    /**
     * control focus atau tidak
     */
    focus?: boolean; 

    /**
     * di pakai kalau mandatory validation failed
     */
    mandatoryValidationFailed: boolean ; 
}

/**
 * <strong>ini blm selesai</strong>
 */
export class EditorSelect2Multiple extends BaseHtmlComponent<EditorSelect2MultipleProps , EditorSelect2MultipleState> implements EditorInputElement {
    constructor(props: EditorSelect2MultipleProps) {
        super(props) ; 
        this.state = {
            data : null !, 
            expanded : false , 
            focus : false  , 
            justClearSelection : false , 
            mandatoryValidationFailed : true , 
            selectedData : []
        };
    }

    /**
     * assign data ke control
     */
    assignDataToControl  (data: any , updateState ?: boolean )  {
        //
    }
    /**
     * membaca data dari control
     */
    fetchDataFromControl (data: any ) {
        let val: any[] = null !; 
        let reader: (val: CommonCommunicationData.CommonLookupValue) => any = !isNull(this.props.selectedDataValueExtractor) ? this.props.selectedDataValueExtractor ! :  (val2: CommonCommunicationData.CommonLookupValue) => {
            return val2.detailCode ; 
        };
        if ( this.state.selectedData && this.state.selectedData.length > 0) {
            for ( let c of this.state.selectedData) {
                let s: any = reader(c) ;
                if ( !isNull(s)) {
                    val.push(s);
                } 
            }
        }
        setValueHelper( data  , this.props.fieldName , val )  ; 
    }
    render () {
        return null ; 
        /*
        return  <div className="  border-around bg-white"  style={{lineHeight: '35px'}}>
                            <ul style={{listStyleType: 'none', margin:'0', padding:'0', overflow:'hidden'}}>
                                { this.msgToList() }
                                <Select2Panel
                                    fieldName='msgTo'
                                    lookupParameter={{
                                        lookupManager : this.lookupManager ,
                                        lovId : 'SecUser'
                                    }}
                                    changeHandlerWithLookup={ insertToMsgTo }
                                    dataListed={ this.state.messageToList}
                                    dataFilter={(data)=>{
                                        for(let z of this.state.messageToList){
                                            if(z.detailCode == data.detailCode) {
                                                return false
                                            }
                                        }
                                        return true
                                    }}
                                    tabIndex={2}
                                    readonlyState={ this.editorState!='add' && this.editorState!='edit' }
                                    registrarMethod={this.registrarInputElement}/>

                            </ul>
                        </div>*/
    }

}