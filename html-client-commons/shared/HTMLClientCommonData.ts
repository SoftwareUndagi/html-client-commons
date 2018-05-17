
import { CommonCommunicationData } from 'core-client-commons'; 
/**
 * data html commons
 */
export namespace HTMLClientCommonData {

    /**
     * generate versi dengan index
     * @param data data untuk di konversi
     */
    export function makeExtendedModelFieldDef (data: CommonCommunicationData.ModelFieldLength): ModelFieldLengthExtended {
        let s: any = data ; 
        let rslt: ModelFieldLengthExtended = s ; 
        rslt.indexedFieldLength = {} ; 
        data.fields.forEach(d => {
            rslt.indexedFieldLength[d.name] = d.length ; 
        });
        return rslt ; 
    }

    /**
     * info model length. di expand
     */
    export interface ModelFieldLengthExtended extends CommonCommunicationData.ModelFieldLength {

        /**
         * panjang ma field. index = nama field
         */
        indexedFieldLength: {[id: string]: number } ; 
    }

}