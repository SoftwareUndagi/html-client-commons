import * as React from "react";
import { CommonCommunicationData, ListOfValueManager } from 'core-client-commons/index';
import { isNull, getElementPosition, HtmlElementPosition, i18n, readNested } from '../utils/index';
import { SearchableComboBoxDropDown } from './SearchableComboBoxDropDown';
import { OffscreenPanelContainer, DetachPanel } from './OffscreenPanelContainer';
import { BaseHtmlComponent, BaseHtmlComponentProps, BaseHtmlComponentState } from './BaseHtmlComponent';
import { BaseSearchableComboBoxMultipleSelectedLabel } from './BaseSearchableComboBoxMultipleSelectedLabel';

export interface BaseSearchableComboBoxMultipleProps extends BaseHtmlComponentProps {
    /**
     * field yang menjadi custom business field. normal nya seharusnya detailCode. null berarti akan di ambil 
     */
    businessCodeFieldName?: 'id' | 'value1' | 'value2' | 'custom';

    /**
     * di pakaai kalau query benar-benar custom(di luar id , value1, value2 untuk business field code)
     */
    businessCodeFieldNameWithNoneStandard?: string;
    /**
     * prefix id dari element
     */
    selectId?: string;
    /**
     * parameter untuk lookup data. kalau select2 mengandalkan data dari select2
     */
    lookupParameter: {
        /**
         * id dari lookup. ini untuk di request kembali ke server
         */
        lovId: string;

        /**
         * lookup containers
         */
        lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };
        /**
         * managaer lookup 
         */
        lookupManager: ListOfValueManager;
    };
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
     * state readonly atau tidak
     */
    readonlyState?: boolean;
    /**
     * custom none selected label. default akan memakai : query.select2.simple.noneSelectedLabel
     */
    noneSelectedLabel?: string;
    /**
     * title untuk hint dalam textbox
     */
    title?: string;
    /**
     * index dari tab
     */
    tabIndex?: number;
    /**
     * change handler dengan lookup data reciever
     */
    changeHandlerWithLookup?: (values: CommonCommunicationData.CommonLookupValue[]) => any;
    /**
     * lebar component. misal 100px , 100%. akan di default 100% kalau tidak di isikan
     */
    width?: string;
    /**
     * initial value
     */
    initialValues?: string[];
    /**
     * kode lookup
     */
    initialData?: CommonCommunicationData.CommonLookupValue[];
    /**
     * filter dengan query. ini kalau perlu filter khusus
     */
    queryDataFilter?: (query: string, data: CommonCommunicationData.CommonLookupValue) => boolean;
    /**
     * generator title untuk item yang di pilih
     */
    titleGenerator?: (value: string, lookupData: CommonCommunicationData.CommonLookupValue) => string;

}

export interface BaseSearchableComboBoxMultipleState extends BaseHtmlComponentState {
    /**
     * value dari current control
     */
    values: string[];
    /**
     * value data as lookup
     */
    valueLookups?: { [id: string]: CommonCommunicationData.CommonLookupValue };
    /**
     * penanda value sudah pernah di set atau tidak
     */
    valueHaveSetted: boolean;
    /**
     * flag drop down tampil atau tidak. none atas atau bawah
     */
    dropDownShowed?: 'none' | 'above' | 'below';

    /**
     * untuk marker data berubah 
     */
    versioner?: number;
}

/**
 * panel untuk multiple selection select 2
 */
export abstract class BaseSearchableComboBoxMultiple<PROPS extends BaseSearchableComboBoxMultipleProps, STATE extends BaseSearchableComboBoxMultipleState> extends BaseHtmlComponent<PROPS, STATE> {

    /**
     * dari dari lookup untuk ID dari lov
     */
    static DEFAULT_LOV_ID: string = 'DEFAULT';
    /**
     * command untuk menutup drop down
     */
    detachDropDown: DetachPanel;
    /**
     * tinggi dari drop down
     */
    dropdownHeight: number = 357;
    /**
     * id default kalau param id prefix tidak di sertakan
     */
    htmlElementIdPrefix: string = 'automated_id_multiple_select_' + new Date().getTime() + '_' + Math.ceil(Math.random() * 100);

    /**
     * flag kalau component ini tidak mempergunakn lookup manager atau tidak
     */
    doesNotUseLookupManager: boolean = false;
    /**
     * generator title untuk item yang di pilih
     */
    defaultTitleGenerator: (value: string, lookupData: CommonCommunicationData.CommonLookupValue) => string = (value: string, lookupData: CommonCommunicationData.CommonLookupValue) => {
        return value;
    }
    /**
     * generator title untuk item yang di pilih
     */
    defaultLabelGenerator: (value: string, lookupData: CommonCommunicationData.CommonLookupValue) => string | JSX.Element = (value: string, lookupData: CommonCommunicationData.CommonLookupValue) => {
        if (isNull(lookupData)) {
            return value;
        }
        return lookupData.label!;
    }
    constructor(props: PROPS) {
        super(props);
        let swapState: STATE = this.generateDefaultState();
        swapState.valueLookups = {};
        this.state = swapState;
        swapState.dropDownShowed = 'none';
        swapState.versioner = 1;
    }
    /**
     * default formatter 
     */
    defaultDropdownLabelFormatter: (data: CommonCommunicationData.CommonLookupValue) => string | JSX.Element = (data: CommonCommunicationData.CommonLookupValue) => {
        console.log('[BaseSearchableComboBoxMultiple#renderLabel] dengan default formatter ');
        let lbl: string = data.label!;
        let code: string = data.detailCode!;
        if (!isNull(this.props.businessCodeFieldName)) {
            if (this.props.businessCodeFieldName === 'custom') {
                if (!isNull(this.props.businessCodeFieldNameWithNoneStandard) && this.props.businessCodeFieldNameWithNoneStandard!.length > 0) {
                    code = readNested(data, this.props.businessCodeFieldNameWithNoneStandard!);
                }
            } else {
                code = readNested(data, this.props.businessCodeFieldName!);
            }
        }
        if (!isNull(data.i18nKey)) {
            lbl = i18n(data.i18nKey!, lbl);
        }
        if (data == null || typeof data === 'undefined') {
            return '';
        }
        return code + ' - ' + lbl;
    }
    /**
     * default query
     */
    queryWorker: (filter: string, checkedData: CommonCommunicationData.CommonLookupValue) => boolean = (filter: string, checkedData: CommonCommunicationData.CommonLookupValue) => {
        if (isNull(filter) || filter.trim().length === 0) {
            return true;
        }
        let uper: string = filter;
        let detailCode: string = checkedData.detailCode!;
        if (!isNull(this.props.businessCodeFieldName)) {
            if (this.props.businessCodeFieldName === 'custom') {
                if (!isNull(this.props.businessCodeFieldNameWithNoneStandard) && this.props.businessCodeFieldNameWithNoneStandard!.length > 0) {
                    detailCode = readNested(checkedData, this.props.businessCodeFieldNameWithNoneStandard!);
                }
            } else {
                detailCode = readNested(checkedData, this.props.businessCodeFieldName!);
            }
        }
        let label: string = checkedData.label!;
        if (!isNull(label)) {
            label = label.toUpperCase();
            if (label.indexOf(uper) >= 0) {
                return true;
            }
        }
        if (!isNull(detailCode)) {
            detailCode = detailCode.toUpperCase();
            if (detailCode.indexOf(uper) >= 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * generate default state untuk combo box
     */
    abstract generateDefaultState(): STATE;

    /**
     * worker untuk assign data lookup ke dalam control
     * @param lookupData data lookup untuk di assign ke control
     */
    assignLookupData(lookupData: CommonCommunicationData.CommonLookupValue[]) {
        console.log('[BaseSearchableComboBoxMultiple]version sekarang : ', this.state.versioner, ' menerima data lookup :', lookupData);
        if (isNull(this.props.lookupParameter.lookupContainers[this.props.lookupParameter.lovId])) {
            this.props.lookupParameter.lookupContainers[this.props.lookupParameter.lovId] = lookupData;
        }
        this.setStateHelper(
            st => {
                if (! (st.versioner) ) {
                    st.versioner = 1; 
                }
                st.versioner += 1;
            }, 
            () => {
                console.log('[BaseSearchableComboBoxMultiple]Data version setelah di update ', this.state.versioner);
            });
    }
    componentWillMount() {
        let swapState: any = this.state;
        let lovId: string = BaseSearchableComboBoxMultiple.DEFAULT_LOV_ID;
        if (!isNull(this.props.lookupParameter)) {
            lovId = this.props.lookupParameter.lovId;
            if (isNull(this.props.lookupParameter.lookupManager)) {
                throw { message: 'Parameter : lookupParameter.lookupManager dan lookupParameter.lookupContainers tidak boleh kosong keduanya. anda perlu mengirimkan lookup manager, atau container lookup. silakan putuskan salah satu, cek lookup : ' + this.props.lookupParameter.lovId };
            }

            if (!isNull(this.props.lookupParameter.lookupManager)) {
                this.props.lookupParameter.lookupManager.register({
                    assignLookupData: this.assignLookupData.bind(this), // , 
                    /*getElement : ()=>{
                        let htmlElementIdPrefix : string = isNull(this.props.selectId) || this.props.selectId.length ===0 ? this.htmlElementIdPrefix : this.props.selectId ; 
                        let rootElement : HTMLElement = document.getElementById(htmlElementIdPrefix + '_root') ; 
                        return rootElement ; 

                    } ,*/
                    lovId: lovId
                });
            }
        } else {
            this.doesNotUseLookupManager = true;
        }
        if (!isNull(this.props.initialValues)) {
            swapState.values = this.props.initialValues;
            for (let v of this.props.initialValues!) {
                let mthchLookup: CommonCommunicationData.CommonLookupValue = this.findByCode(v);
                if (!isNull(mthchLookup)) {
                    swapState.valueLookups[v] = mthchLookup;
                }
            }
        }
    }
    /**
     * mencari dalam lookup dengan kode lookup
     * @param code kode untuk di cari
     */
    findByCode(code: string): CommonCommunicationData.CommonLookupValue {

        let lovId: string = this.props.lookupParameter.lovId;
        let lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] } = this.props.lookupParameter.lookupContainers;
        if (isNull(lookupContainers) || isNull(lookupContainers[lovId])) {
            return (null)!;
        }
        for (let c of lookupContainers[lovId]) {
            if (c.detailCode === code) {
                return c;
            }
        }
        return (null)!;
    }

    /**
     * untuk menutup drop down
     */
    closeDropDown: () => any = () => {
        if (!isNull(this.detachDropDown)) {
            this.detachDropDown();
            this.detachDropDown = (null)!;
        }
        this.setStateHelper(cl => {
            cl.dropDownShowed = 'none';
            if ( !(cl.versioner)) {
                cl.versioner = 1;
            }
            cl.versioner += 1;
        });
    }
    renderNormalSelector(): JSX.Element {
        let w: string = '100%';
        if (!isNull(this.props.width)) {
            w = this.props.width!;
        }
        let ro: boolean = isNull(this.props.readonlyState) ? false : this.props.readonlyState!;
        let htmlElementIdPrefix: string = isNull(this.props.selectId) || this.props.selectId!.length === 0 ? this.htmlElementIdPrefix : this.props.selectId!;
        let selectedItemContents: JSX.Element[] = [];
        if (!isNull(this.state.values) && this.state.values.length > 0) {
            let runnningFormatter: (lookup: CommonCommunicationData.CommonLookupValue) => string | JSX.Element =
                isNull(this.props.selectedDataLabelFormatter) ? this.defaultDropdownLabelFormatter :
                    (lookup: CommonCommunicationData.CommonLookupValue) => {
                        console.log('[BaseSearchableComboBoxMultiple#renderLabel] dengan PROP formatter ');
                        return this.props.selectedDataLabelFormatter!(lookup);
                    };

            selectedItemContents = this.state.values.map((val: string) => {
                // let lkpData : CommonCommunicationData.CommonLookupValue = this.state.valueLookups[val] ; 
                return (
                <BaseSearchableComboBoxMultipleSelectedLabel
                    key={val}
                    labelFormatter={runnningFormatter}
                    lookupContainer={this.props.lookupParameter.lookupContainers}
                    lovId={this.props.lookupParameter.lovId}
                    value={val}
                    onRemoveItemClick={this.onRemoveItemCLick}
                    versioner={this.state.versioner!}
                    readonlyState={ro} 
                />
                );
            });
        }

        let selInp: any[] = [] ; 
        if (isNull(this.props.readonlyState) || !this.props.readonlyState)  {
            selInp = [(
                    <li className='select2-search select2-search--inline'>
                        <input 
                            className='select2-search__field' 
                            type={!isNull(this.props.readonlyState) && this.props.readonlyState ? 'hidden' : 'search'}
                            autoCapitalize='off'
                            autoComplete='off'
                            autoCorrect='off'
                            spellCheck={false}
                            style={{ width: '0.75em' }}
                            onFocus={(evt: any) => {
                                if (!isNull(evt.preventDefault)) {
                                    evt.preventDefault();
                                }
                                if (!isNull(evt.stopPropagation)) {
                                    evt.stopPropagation();
                                }
                                this.showDropDownCommand();
                            }}
                            onClick={evt => {
                                if (!isNull(evt.preventDefault)) {
                                    evt.preventDefault();
                                }
                                if (!isNull(evt.stopPropagation)) {
                                    evt.stopPropagation();
                                }
                            }} 
                        />
                    </li>)
            ];
        } 
        return (
        <span className="select2 select2-container select2-container--default select2-container--below" dir="ltr" style={{ width: w }} id={htmlElementIdPrefix + '_root'}>
            <span className="selection">
                <span 
                    className="select2-selection select2-selection--multiple"
                    role="combobox" 
                    aria-autocomplete="list" 
                    aria-haspopup="true" 
                    aria-expanded="false" 
                    tabIndex={0} 
                    aria-owns="select2-bo1u-results"
                    onClick={evt => {
                        if (!isNull(evt.preventDefault)) {
                            evt.preventDefault();
                        }
                        if (!isNull(evt.stopPropagation)) {
                            evt.stopPropagation();
                        }
                        if (isNull(this.props.readonlyState) || !this.props.readonlyState) {
                            this.showDropDownCommand();
                        }
                    }}
                >
                    <ul className='select2-selection__rendered'>
                        {selectedItemContents}
                        {selInp}
                    </ul>
                </span>
            </span>
            <span className="dropdown-wrapper" aria-hidden="true">{}
            </span>
        </span>
        );
    }

    fireChangeEvent: () => any = () => {
        console.log('[BaseSearchableComboBoxMultiple#fireChangeEvent]');
        if (!isNull(this.props.changeHandler)) {
            this.props.changeHandler!(this.state.values);
        }
        let lks: CommonCommunicationData.CommonLookupValue[] = [];
        if (!isNull(this.state.values) && this.state.values.length > 0) {
            for (let v of this.state.values) {
                let s: CommonCommunicationData.CommonLookupValue = this.state.valueLookups![v];
                if (!isNull(s)) {
                    lks.push(s);
                }
            }
        }
        if (!isNull(this.props.changeHandlerWithLookup)) {
            this.props.changeHandlerWithLookup!(lks.length > 0 ? lks : (null)!);
        }

    }

    /**
     * get value dari selected item
     */
    get selectedValuesAsLookup(): CommonCommunicationData.CommonLookupValue[] {
        let lks: CommonCommunicationData.CommonLookupValue[] = [];
        if (!isNull(this.state.values) && this.state.values.length > 0) {
            for (let v of this.state.values) {
                let s: CommonCommunicationData.CommonLookupValue = this.state.valueLookups![v];
                if (isNull(s)) {
                    s = this.state.valueLookups![v + ''];
                }
                if (isNull(s)) {
                    let swapKey: any = v;
                    s = this.state.valueLookups![swapKey / 1];
                }
                if (!isNull(s)) {
                    lks.push(s);
                }
            }
        }
        return lks;
    }

    /**
     * remove item selected
     */
    onRemoveItemCLick: (val: string) => any = (val: string) => {
        if (this.state.values.indexOf(val) < 0) {
            return;
        }
        this.setStateHelper(
            stBaru => {
                if (stBaru.values.indexOf(val) >= 0) {
                    stBaru.values.splice(this.state.values.indexOf(val), 1);
                    if ( !(stBaru.versioner)) {
                        stBaru.versioner = 1;
                    }
                    stBaru.versioner += 1;
                }
            }, 
            this.fireChangeEvent);
    }
    /**
     * untuk menampilkan drop down
     */
    showDropDownCommand: () => any = () => {
        if (!isNull(this.props.readonlyState) && this.props.readonlyState) {
            return;
        }
        this.showDropdownWorker()
            .then(d => { 
                //
            })
            .catch(e => {
                console.error('[BaseSearchableComboBoxMultiple#showDropDownCommand] gagal memproses drop down, error : ', e);
            });
    }
    /**
     * calculator posisi drop down
     */
    calculateDropDownPosition: (dropDownHeight: number, position?: 'above' | 'below') => any = (dropDownHeight: number, position?: 'above' | 'below') => {
        let htmlElementIdPrefix: string = isNull(this.props.selectId) || this.props.selectId!.length === 0 ? this.htmlElementIdPrefix : this.props.selectId!;
        let rootElement: HTMLElement = document.getElementById(htmlElementIdPrefix + '_root')!;
        let pos: HtmlElementPosition = getElementPosition(rootElement);
        let rct: ClientRect = rootElement.getBoundingClientRect();

        let windowHeight: number = window.innerHeight;
        let scrollOffset: number = window.pageYOffset;
        let sisa: number = windowHeight - (pos.top - scrollOffset) - dropDownHeight;
        let dispFlag: 'above' | 'below' = 'below';
        let dropTop: number = pos.top + 30;
        if (!isNull(position)) {
            if (position === 'below') {
                //
            } else {
                dispFlag = 'above';
                dropTop = pos.top - dropDownHeight;
            }
        } else {
            if (sisa >= 0) {
                // tampil ke bawah
            } else {
                // tampil ke atas
                dispFlag = 'above';
                dropTop = pos.top - dropDownHeight + 123;
            }
        }

        console.log('[BaseSearchableComboBox] drop down variables > windowHeight : ', windowHeight, '.pos:', pos, '.rct :', rct, '.scrollOffset:', scrollOffset, '.dispFlag:', dispFlag, '.dropDownHeight : ', dropDownHeight);
        return {
            dispFlag: dispFlag,
            top: dropTop,
            left: pos.left,
            width: rct.width,
        };
    }
    /**
     * bridge ke : onShowDropdownClick. untuk memudahkan operasi async
     */
    protected showDropdownWorker(): Promise<any> {
        return new Promise<any>((accept: (n: any) => any, reject: (exc: any) => any) => {
            let s: any = this.calculateDropDownPosition(this.dropdownHeight) ;
            this.setStateHelperAsync(cl => {
                cl.dropDownShowed = s.dispFlag;
                if ( !(cl.versioner)) {
                    cl.versioner = 1; 
                }
                cl.versioner += 1;
            }).then(r1 => {
                let dropDownData: CommonCommunicationData.CommonLookupValue[] = [];
                let rawData: CommonCommunicationData.CommonLookupValue[] = (null)! ; 
                if (!isNull(this.props.initialData)) {
                    rawData = this.props.initialData!;
                } else {
                    if (!isNull(this.props.lookupParameter.lookupManager)) {
                        this.props.lookupParameter.lookupManager.loadFromCacheSingle(this.props.lookupParameter.lovId)
                            .then( (swap: CommonCommunicationData.CommonLookupValue[]) => {
                                if (!isNull(swap)) {
                                    rawData = swap;
                                }
                                this.showDropdownWorkerWithData(dropDownData, rawData);
                                accept({}); 
                            } )
                            .catch(reject);
                        
                        return ; 
                    }
                }
                this.showDropdownWorkerWithData(dropDownData, rawData);
            })
            .catch(reject);
        });
    }

    protected showDropdownWorkerWithData(dropDownData: CommonCommunicationData.CommonLookupValue[] , rawData: CommonCommunicationData.CommonLookupValue[]  ): Promise<any> {
        return new Promise<any>((accept: (n: any) => any, reject: (exc: any) => any) => {
            let s: any = this.calculateDropDownPosition(this.dropdownHeight);
            let htmlElementIdPrefix: string = isNull(this.props.selectId) || this.props.selectId!.length === 0 ? this.htmlElementIdPrefix : this.props.selectId!;
            if (isNull(this.props.dataFilter)) {
                dropDownData = rawData;
            } else {// filter data untuk dir ender
                if (!isNull(rawData)) {
                    for (let d of rawData) {
                        if (this.props.dataFilter!(d)) {
                            dropDownData.push(d);
                        }

                    }
                }
            }
            this.detachDropDown = OffscreenPanelContainer.getOffscreenPanelContainer()
                .appendPanel( (
                <SearchableComboBoxDropDown
                    labelFormatter={isNull(this.props.dropDownlabelFormatter) ? this.defaultDropdownLabelFormatter : this.props.dropDownlabelFormatter!}
                    left={s.left}
                    width={s.width}
                    top={s.top}
                    key={htmlElementIdPrefix + '_drop_down'}
                    htmlElementIdPrefix={htmlElementIdPrefix + '_drop_down'}
                    dropdownData={dropDownData}
                    queryDataFilter={!isNull(this.props.queryDataFilter) ? this.props.queryDataFilter! : this.queryWorker}
                    closeCommand={this.closeDropDown}
                    onItemSelected={this.onDataSelected}
                    dropDownPosition={s.dispFlag}
                    calculateDropDownPosition={this.calculateDropDownPosition}
                    currentSelectedIds={this.state.values} 
                />)
            );
            accept({});
        });
    }
    /**
     * handler kalau data ada yang di pilih dari dropw down
     */
    protected onDataSelected: (data: CommonCommunicationData.CommonLookupValue) => any = (data: CommonCommunicationData.CommonLookupValue) => {
        let id: string = data.detailCode!;
        this.setStateHelper(
            st => {
                if ( !st.values ) {
                    st.values = [] ; 
                }
                let idx: number = st.values.indexOf(id);
                if (idx >= 0) {
                    st.values.splice(idx, 1);
                    delete st.valueLookups![id];
                } else {
                    st.values.push(id);
                    st.valueLookups![id] = data;
                }
                if ( !(st.versioner)) {
                    st.versioner = 1 ; 
                }
                st.versioner += 1;
            }, 
            this.fireChangeEvent);
    }

}
