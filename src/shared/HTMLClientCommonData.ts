import { ModelFieldLength } from "base-commons-module";

/**
     * info model length. di expand
     */
export interface ModelFieldLengthExtended extends  ModelFieldLength {

    /**
     * panjang ma field. index = nama field
     */
    indexedFieldLength: { [id: string]: number };
}

/**
 * data html commons
 */
export class HTMLClientCommonData {

    /**
     * generate versi dengan index
     * @param data data untuk di konversi
     */
    static makeExtendedModelFieldDef(data:  ModelFieldLength): ModelFieldLengthExtended {
        let s: any = data;
        let rslt: ModelFieldLengthExtended = s;
        rslt.indexedFieldLength = {};
        data.fields.forEach(d => {
            rslt.indexedFieldLength[d.name] = d.length;
        });
        return rslt;
    }



}