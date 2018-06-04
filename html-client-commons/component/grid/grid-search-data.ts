import { CommonCommunicationData } from 'core-client-commons/index';

export namespace GridSearchData {

    export interface DateQueryMetadata {
        /**
         * custom data formatter. kalau 
         */
        dateFormatter?: (value: Date) => string;
        /**
         * tanggal minimal dari dari date picker
         */
        minMate?: Date;
        /**
         * tanggal maksimal dalam date picker
         */
        maxDate?: Date;
        /**
         * array tanggal yang di disabled
         */
        datesDisabled?: Date[];
    }

    /**
     * date from to picker metadata
     */
    export interface DateFromToMetadata {
        /**
         * change handler. change handler dari filter
         */
        changeHandler?: (dateFrom: Date, dateTo: Date) => any;

        /**
         * css untuk textbox
         */
        className?: string;

        /**
         * metadata date from 
         */
        dateFromMetadata?: DateQueryMetadata;

        /**
         * metadata to 
         */
        dateToMetadata?: DateQueryMetadata;
    }
    /**
     * handler untuk multiple item 
     */
    export interface MultipleSelectionMetadata {
        /**
         * field yang menjadi custom business field. normal nya seharusnya detailCode. null berarti akan di ambil 
         */
        businessCodeFieldName?: 'id' | 'value1' | 'value2' | 'custom';

        /**
         * di pakaai kalau query benar-benar custom(di luar id , value1, value2 untuk business field code)
         */
        businessCodeFieldNameWithNoneStandard?: string;
        /**
         * modificator data. kalau memerlukan modifikasi data dari lookup. misal : mengatur urutan dari data. mengatur level dari data(untuk presentasi tree)
         */
        lookupDataTransformator?: (lookups: CommonCommunicationData.CommonLookupValue[]) => CommonCommunicationData.CommonLookupValue[];
        /**
         * formatter label combo box
         */
        dropDownlabelFormatter?: (lookup: CommonCommunicationData.CommonLookupValue) => string | JSX.Element;
        /**
         * untuk render item yang selected . bagian atas pada saat ada item yang di pilih
         */
        selectedDataLabelFormatter?: (lookup: CommonCommunicationData.CommonLookupValue) => string | JSX.Element;
        /**
         * data filter. untuk memproses data yang di tampilkan 
         */
        dataFilter?: (lookup: CommonCommunicationData.CommonLookupValue) => boolean;
        /**
         * change handler untuk textbox
         */
        changeHandler?: (values: string[]) => any;
        /**
         * change handler dengan lookup data reciever
         */
        changeHandlerWithLookup?: (values: CommonCommunicationData.CommonLookupValue[]) => any;
        /**
         * generator title untuk item yang di pilih
         */
        titleGenerator?: (value: string, lookupData: CommonCommunicationData.CommonLookupValue) => string;
        /**
         * generator label
         */
        labelGenerator?: (value: string, lookupData: CommonCommunicationData.CommonLookupValue) => string | JSX.Element;
        /**
         * field untuk di pakai filter
         */
        fieldForFilter?: 'detailCode' | 'label' | 'value1' | 'value2' | 'custom';

        /**
         * di pakai kalau bukan di antara detailCode , label , value1 , value2
         */
        fieldForFilterCustom?: string;
        /**
         * value numeric atau bukan
         */
        isNumericValue?: boolean;
        /**
         * default = false. artinya pakai in
         */
        useNotInQuery?: boolean;
        /**
         * kalau perlu label pada header grid untuk selected item, ini bisa di pergunakan 
         */
        selectedItemPanelGenerator ?:  ( selectedData: CommonCommunicationData.CommonLookupValue[] ) => JSX.Element ; 
    }

    /**
     * metdata untuk select2 
     */
    export interface Select2SearchMetadata {
        /**
         * change handler. kalau di perlukan tambahan
         */
        changeHandler?: (val: string) => any;
        /**
         * append none selected. default = true 
         */
        appendNoneSelected?: boolean;

        /**
         * init value untuk searching
         */
        initialSearchValue ?: string ; 
        /**
         * combo formatter
         */
        comboLabelFormater?: (lookup: CommonCommunicationData.CommonLookupValue) => string;
        /**
         * filter data
         */
        dataFilter?: (data: CommonCommunicationData.CommonLookupValue) => boolean;
        /**
         * flag field yang di query berupa numeric atau bukan, kalau numeric, data akan di konversikan menjadi angka terlebih dahulu
         */
        isNumericValue?: boolean;
        /**
         * tab index. kalau di perlukan pengaturan manual
         */
        tabIndex?: number;
    }

    /**
     * untuk date picker search
     */
    export interface DatePickerSearchMetadata {
        /**
         * change handler. kalau di perlukan tambahan
         */
        changeHandler?: (val: Date) => any;
        /**
         * initial value untuk search
         */
        initialSearchValue?: Date;
        /**
         * nama class untuk css textbox
         */
        className?: string;

        /**
         * tab index
         */
        tabIndex?: number;
    }

    /**
     * props untuk textbox
     */
    export interface TextboxSearchMetadata {
        /**
         * initial value untuk search
         */
        initialSearchValue?: string | number;
        /**
         * kalau true , maka kalau input blank akan tidak di sertakan
         */
        doNotIncludeWhenBlank?: boolean;

        /**
         * tab index
         */
        tabIndex?: number;
        /**
         * nama class untuk css textbox
         */
        className?: string;
        /**
         * disabled
         */
        disabled?: boolean;
        /**
         * mempergunakan number atau tidak
         */
        useNumber?: boolean;
        /**
         * change handler. kalau di perlukan tambahan
         */
        changeHandler?: (val: string) => any;
        /**
         * style untuk textbox
         */
        style?: React.CSSProperties;
        /**
         * kalau misal di isikan, query akan mempergunakan in atau not in 
         */
        textSearchMultipleValueParameterConfig?: {
            /**
             * delimiter per parameter
             */
            delimiter: string;
            /**
             * flag pergunakan not in atau tidak
             */
            useNotIn?: boolean;
        };
    }

}