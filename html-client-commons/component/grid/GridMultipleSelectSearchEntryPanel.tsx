import * as React from 'react';
import { isNull, CloseEditorCommandAsync, ListOfValueManager, CommonCommunicationData, readNested  } from 'core-client-commons/index';
import { BaseHtmlComponent, BaseHtmlComponentProps, BaseHtmlComponentState } from '../BaseHtmlComponent';
import { GridHeaderSearchDefinition } from './SimpleGridMetadata';
import { GridSearchData } from './grid-search-data';
import { SearchableComboBoxMultiple } from '../SearchableComboBoxMultiple';

export interface GridMultipleSelectSearchEntryPanelProps extends BaseHtmlComponentProps {
    /**
     * lookup manager. untuk akses langsung ke lookup 
     */
    lookupManager: ListOfValueManager;
    /**
     * container lookup actual yang di pakai oleh grid
     */
    lookupContainers: { [id: string]: CommonCommunicationData.CommonLookupValue[] };

    /**
     * id dari lookup
     */
    lovId: string;

    /**
     * title dari column. di bagian header nama nya apa
     */
    columnTitle: string;
    /**
     * command untuk menaruh panel dalam grid. ini untuk search yang perlu areal lebar. ndak cukup dengan drop down
     */
    putPanelInsideGridCommand: (panels: JSX.Element[]) => CloseEditorCommandAsync;
    /**
     * definisi search
     */
    searchDef: GridHeaderSearchDefinition;
    /**
     * assign query untuk where. ada 2 macam where. where pada model, atau pada included association. bagian ini hanya mengurus pada where
     * @param key field untuk query 
     * @param queryValue value dari query. kalau null ini akan menghapus param query
     */
    assignQueryHandler: (key: string, queryValue: any) => any; 
    /**
     * command untuk remove query
     */
    removeQueryHandler: (key: string) => any;

    /**
     * worker untuk assign query ke dalam include dari 
     * @param key key dari query 
     * @param queryValue value untuk query 
     * @param modelName nama model dari object
     * @param asName kalau ada alias/as dar model object 
     */
    assignQueryOnIncludeModel: (modelName: string, key: string, queryValue: any, useInnerJoin: boolean, asName?: string) => any;
    /**
     * untuk remove query pada include
     */
    removeQueryOnIncludeModel: (modelName: string, key: string, asName?: string) => any;

    /**
     * navigasi halaman ke halaman di minta. 
     * @param page page yang di minta untuk di load
     */
    navigate: (page: number) => any;
}
export interface GridMultipleSelectSearchEntryPanelState extends BaseHtmlComponentState {
    /**
     * state dari view
     */
    state: 'normal' | 'popup';
    /**
     * value yang di pilih 
     */
    selectedValues: CommonCommunicationData.CommonLookupValue[];

    selectedValuesTemp: CommonCommunicationData.CommonLookupValue[];
}

export class GridMultipleSelectSearchEntryPanel extends BaseHtmlComponent<GridMultipleSelectSearchEntryPanelProps, GridMultipleSelectSearchEntryPanelState> {
    /**
     * template untuk header search
     */
    static TEMPLATE_TITLE_HEADER_SEARCH: string = 'Filter untuk :title';
    /**
     * field pada props untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_PROPS: string[] = ['columnTitle'];
    /**
     * field yang di compare pada state untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_STATE: string[] = ['state', 'selectedValuesTemp', 'selectedValues'];
    /**
     * command untuk menutup panel
     */
    closePopupCommand: CloseEditorCommandAsync;
    searchOnJoin: boolean;
    /**
     * reference ke selector, untuk akses ke selected item
     */
    multipleSelector: SearchableComboBoxMultiple;
    /**
     * default generator untuk selected item label. di bagian header
     */
    static DEFAULT_SELECTED_DATA_GENERATOR: (selectedData: CommonCommunicationData.CommonLookupValue[]) => JSX.Element = (selectedData: CommonCommunicationData.CommonLookupValue[]) => {
        let lbls: string[] = isNull(selectedData) ? [] : selectedData.map(c => { return c.label!; });
        let rndLabel: string = lbls.join(',') ; 
        return <span style={{ textOverflow: 'ellipsis' }} title={rndLabel}>{rndLabel}</span>;
    }
    constructor(props: GridMultipleSelectSearchEntryPanelProps) {
        super(props);
        this.state = {
            state: 'normal',
            selectedValues: null!,
            selectedValuesTemp: null!
        };
        if (!isNull(props.searchDef.searchOnJoinDefinition)) {
            this.searchOnJoin = true;
        }
    }

    render(): JSX.Element {
        return (
        <div 
            style={{ width: '100%', cursor: 'pointer' }}
            onClick={evt => {
                if (!isNull(evt.stopPropagation)) {
                    evt.stopPropagation();
                }
                if (!isNull(evt.preventDefault)) {
                    evt.preventDefault();
                }
                if (this.state.state === 'popup') {
                    return;
                }
                this.setStateHelper(st => {
                    st.state = 'popup';
                });
                this.closePopupCommand = this.props.putPanelInsideGridCommand([this.renderSelectorPanel()]);
            }}
        >
            {this.renderNonSelectedFilter()}
            {this.renderLabelPanel()}
            {this.renderClearCommandPanel()}
        </div>);
    }

    private renderLabelPanel(): JSX.Element {
        let swapDef: any = this.props.searchDef.additonalControlMetadata;
        let def: GridSearchData.MultipleSelectionMetadata = swapDef;
        if (!isNull(def.selectedItemPanelGenerator)) {
            return def.selectedItemPanelGenerator!(this.state.selectedValues);
        }
        return GridMultipleSelectSearchEntryPanel.DEFAULT_SELECTED_DATA_GENERATOR(this.state.selectedValues);
    }
    private renderNonSelectedFilter(): JSX.Element {
        if (!isNull(this.state.selectedValues) && this.state.selectedValues.length > 0) {
            return <input type='hidden' />;
        }
        return <a style={{ textAlign: 'center' }}><i className='fa fa-filter' title={'Filter data'} /></a>;
    }

    private renderSelectorPanel(): JSX.Element {
        let swapDef: any = this.props.searchDef.additonalControlMetadata;
        let def: GridSearchData.MultipleSelectionMetadata = swapDef;
        if (isNull(def)) {
            def = {};
        }
        let lblTitle: string = GridMultipleSelectSearchEntryPanel.TEMPLATE_TITLE_HEADER_SEARCH.split(':title').join('<i>' + this.props.columnTitle + '</i>');
        let initVal: string[] = isNull(this.state.selectedValues) ? null! : this.state.selectedValues.map(v => { return v.detailCode!; });
        return (
        <div style={{ paddingTop: '20px', paddingLeft: '10px', paddingRight: '10px' }}>
            <div className='well'>
                <strong ><span dangerouslySetInnerHTML={{ __html: lblTitle }} /> </strong><br />
                <SearchableComboBoxMultiple
                    initialValues={initVal}
                    lookupParameter={{ lookupContainers: this.props.lookupContainers, lookupManager: this.props.lookupManager, lovId: this.props.lovId }}
                    changeHandler={def.changeHandler}
                    changeHandlerWithLookup={(values: CommonCommunicationData.CommonLookupValue[]) => {
                        console.log('[GridMultipleSelectSearchEntryPanel#renderSelectorPanel] menerima lookup selected : ', values);
                        this.setStateHelper(
                            st => st.selectedValuesTemp = values, () => {
                            if (!isNull(def.changeHandlerWithLookup)) {
                                def.changeHandlerWithLookup!(values);
                            }
                        });
                    }}
                    businessCodeFieldName={def.businessCodeFieldName}
                    businessCodeFieldNameWithNoneStandard={def.businessCodeFieldNameWithNoneStandard}
                    dataFilter={def.dataFilter}
                    dropDownlabelFormatter={def.dropDownlabelFormatter}
                    lookupDataTransformator={def.lookupDataTransformator}
                    selectedDataLabelFormatter={def.selectedDataLabelFormatter}
                    titleGenerator={def.titleGenerator}
                    ref={(d: any) => {
                        this.multipleSelector = d!;
                    }} 
                /><br/>
                <a onClick={this.onSelectClick}><i className='fa fa-check-circle-o' /></a>&nbsp;
                        <a onClick={this.onCloseClick}><i className='fa fa-close' /></a>
            </div>
        </div>
        );
    }

    private renderClearCommandPanel(): JSX.Element {
        if (isNull(this.state.selectedValues) || this.state.selectedValues.length === 0) {
            return <span key='clear_control_empty' />;
        }
        return (
        <a 
            key='close_command'
            style={{ float: 'right' }}
            onClick={evt => {
                if (!isNull(evt.stopPropagation)) {
                    evt.stopPropagation();
                }
                if (!isNull(evt.preventDefault)) {
                    evt.preventDefault();
                }
                this.setStateHelper(
                    st => st.selectedValues = null!, 
                    () => {
                        this.clearQuery();
                        this.props.navigate(0);
                    });
            }}
        ><i className='fa fa-remove' />
        </a>);
    }

    private clearQuery() {
        if (this.searchOnJoin) {
            this.props.removeQueryOnIncludeModel(this.props.searchDef!.searchOnJoinDefinition!.modelName, this.props.searchDef.queryField, this.props.searchDef!.searchOnJoinDefinition!.includeAs);
        } else {
            this.props.removeQueryHandler(this.props.searchDef.queryField);
        }
    }

    /**
     * ini untuk propagete query ke query invoker
     */
    private applyQueryToHandler() {
        console.log('[GridMultipleSelectSearchEntryPanel#applyQueryToHandler]');
        let swapDef: any = this.props.searchDef.additonalControlMetadata;
        let def: GridSearchData.MultipleSelectionMetadata = swapDef;
        if (isNull(def)) {
            def = {};
        }
        if (isNull(this.state.selectedValues) || this.state.selectedValues.length === 0) {
            this.clearQuery();
        } else {
            let queryField: string = 'detailCode';
            if (!isNull(def.fieldForFilter)) {
                if (def.fieldForFilter === 'custom') {
                    queryField = def.fieldForFilterCustom!;
                } else {
                    queryField = def.fieldForFilter!;
                }
            }
            let opr: string = isNull(def.useNotInQuery) || !def.useNotInQuery ? '$in' : '$notIn';
            let numericValFlag: boolean = isNull(def.isNumericValue) ? false : def.isNumericValue!;
            let actualOperator: any[] = [];
            this.state.selectedValues.forEach((v: CommonCommunicationData.CommonLookupValue) => {
                let swData: any = readNested(v, queryField);
                if (isNull(swData)) {
                    return;
                }
                if (numericValFlag && !isNaN(swData)) {
                    actualOperator.push(swData / 1);
                } else {
                    actualOperator.push(swData);
                }
            });
            if (actualOperator.length === 0) {
                this.clearQuery();
                this.props.navigate(0);
                return;
            }
            let queryVal: any = {
                [opr]: actualOperator
            };
            if (this.searchOnJoin) {
                this.props.assignQueryOnIncludeModel(this.props.searchDef!.searchOnJoinDefinition!.modelName, this.props.searchDef.queryField, queryVal, isNull(this.props!.searchDef!.searchOnJoinDefinition!.useInnerJoin) ? false : this.props!.searchDef!.searchOnJoinDefinition!.useInnerJoin!, this.props.searchDef.searchOnJoinDefinition!.includeAs);
            } else {
                this.props.assignQueryHandler(this.props.searchDef.queryField, queryVal);
            }
            this.props.navigate(0);

        }
    }
    private onCloseClick: (evt: any) => any = (evt: any) =>  {
        if (!isNull(evt.stopPropagation)) {
            evt.stopPropagation();
        }
        if (!isNull(evt.preventDefault)) {
            evt.preventDefault();
        }

        this.setStateHelper(st => {
            st.state = 'normal';
        });
        if (!isNull(this.closePopupCommand)) {
            this.closePopupCommand().then(d => {
                this.closePopupCommand = null!;
            }).catch(exc => {
                this.closePopupCommand = null!;
                console.error('[GridMultipleSelectSearchEntryPanel#renderSelectorPanel] error close panel : ', exc);
            });

        }
    }
    private onSelectClick: (evt: any) => any = (evt: any) => {
        if (isNull(this.multipleSelector)) {
            console.error('[GridMultipleSelectSearchEntryPanel#onSelectClick] reference : multipleSelector null. perbaiki metode ini');
        }
        let vals: CommonCommunicationData.CommonLookupValue[] = this.multipleSelector.selectedValuesAsLookup;
        console.log('[GridMultipleSelectSearchEntryPanel#onSelectClick] handler pilih data');
        if (!isNull(evt.stopPropagation)) {
            evt.stopPropagation();
        }
        if (!isNull(evt.preventDefault)) {
            evt.preventDefault();
        }
        this.setStateHelper(
            st => {
                st.selectedValues = vals;
                st.state = 'normal';
            }, 
            () => {
                if (!isNull(this.closePopupCommand)) {
                    this.closePopupCommand().then(d => {
                        this.closePopupCommand = null!;
                    }).catch(exc => {
                        this.closePopupCommand = null!;
                        console.error('[GridMultipleSelectSearchEntryPanel#renderSelectorPanel] error close panel : ', exc);
                    });

                }
                this.applyQueryToHandler();
            });
    }
}