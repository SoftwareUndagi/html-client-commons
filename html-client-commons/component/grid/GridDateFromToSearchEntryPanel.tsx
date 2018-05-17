import * as React from 'react';
import { isNull, CloseEditorCommandAsync, makeIsoDateTime , DateUtils } from 'core-client-commons';
import { BaseHtmlComponent, BaseHtmlComponentProps, BaseHtmlComponentState } from '../BaseHtmlComponent';
import { GridHeaderSearchDefinition } from './SimpleGridMetadata';
import { geneteDate00Hour, geneteDateMaxedHour } from '../../utils/index';
import { DatePickerWrapper } from '../DatePickerWrapper';
import { GridSearchData } from './grid-search-data';
import { GridDateFromToSearchEntryPanelDateLabel } from './GridDateFromToSearchEntryPanelDateLabel';

export interface SelectedDateQueryLabel {
    /**
     * default : dari {dateFrom}
     */
    from: string;
    /**
     * s.d
     */
    to: string;
}

export interface GridDateFromToSearchEntryPanelProps extends BaseHtmlComponentProps {
    /**
     * title dari column. di bagian header nama nya apa
     */
    columnTitle: string ; 
    labels?: SelectedDateQueryLabel;
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
export interface GridDateFromToSearchEntryPanelState extends BaseHtmlComponentState {
    /**
     * pilhan tanggal dari 
     */
    dateFrom: Date;
    /**
     * pilihan tgl sampai
     */
    dateTo: Date;
    /**
     * state dari view
     */
    state: 'normal' | 'popup';
    /**
     * pilhan tanggal dari 
     */
    dateFromTemp: Date;
    /**
     * pilihan tgl sampai
     */
    dateToTemp: Date;
    /**
     * tanggal minimum untuk date to. = date 
     */
    dateToMinimum: Date ;
}
/**
 * panel untuk date from to 
 */
export class GridDateFromToSearchEntryPanel extends BaseHtmlComponent<GridDateFromToSearchEntryPanelProps, GridDateFromToSearchEntryPanelState> {
    /**
     * field pada props untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_PROPS: string[] = ['searchDef'];
    /**
     * field yang di compare pada state untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_STATE: string[] = ['dateFrom', 'dateTo', 'state'];
    /**
     * default labeler
     */
    static DEFAULT_LABEL: SelectedDateQueryLabel = {
        from: 'dari',
        to: 's.d.'
    };
    /**
     * template untuk header search
     */
    static TEMPLATE_TITLE_HEADER_SEARCH: string = 'Filter untuk :title' ; 

    searchOnJoin: boolean = false;
    /**
     * command untuk menutup panel
     */
    closePopupCommand: CloseEditorCommandAsync;
    /**
     * untuk membuat id berbeda tiap popup
     */
    dynamicKeyIndexer: number = 1;

    constructor(props: GridDateFromToSearchEntryPanelProps) {
        super(props);
        this.state = {
            dateFrom: null!,
            dateTo: null!,
            dateFromTemp: null!,
            dateToTemp: null!,
            state: 'normal' , 
            dateToMinimum : null !
        };
        if (!isNull(props.searchDef.searchOnJoinDefinition)) {
            this.searchOnJoin = true;
        }
    }
    shouldComponentUpdate(nextProps: GridDateFromToSearchEntryPanelProps, nextState: GridDateFromToSearchEntryPanelState): boolean {
        if (this.compareForShouldComponentUpdateStateOrProp(GridDateFromToSearchEntryPanel.FIELD_COMPARED_PROPS, this.props, nextProps)) {
            return true;
        }
        if (this.compareForShouldComponentUpdateStateOrProp(GridDateFromToSearchEntryPanel.FIELD_COMPARED_STATE, this.state, nextState)) {
            return true;
        }
        return false;
    }
    generateTitleLabel(): string {
        let lbl: SelectedDateQueryLabel = isNull(this.props.labels) ? GridDateFromToSearchEntryPanel.DEFAULT_LABEL : this.props.labels!;
        if (isNull(this.state.dateFrom) && isNull(this.state.dateTo)) {
            return '';
        } else if (!isNull(this.state.dateFrom) && isNull(this.state.dateTo)) {
            return lbl.from + ' ' + DateUtils.formatDate(this.state.dateFrom);
        } else if (isNull(this.state.dateFrom) && isNull(!this.state.dateTo)) {
            return lbl.to + ' ' + DateUtils.formatDate(this.state.dateTo);
        }
        return lbl.from + ' ' + DateUtils.formatDate(this.state.dateFrom) + ' ' + lbl.to + DateUtils.formatDate(this.state.dateTo);
    }
    render(): JSX.Element {
        return (
        <div 
            style={{ width: '100%', cursor: 'pointer' }} 
            title={this.generateTitleLabel()}
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
        </div>
        );
    }

    private renderNonSelectedFilter (): JSX.Element {
        if ( !isNull(this.state.dateFrom) || !isNull(this.state.dateTo)) {
            return <input type='hidden'/>; 
        }
        return <a style={{textAlign: 'center'}}><i className='fa fa-calendar' title={'Filter data'}/></a> ; 
    }

    private renderClearCommandPanel(): JSX.Element {
        if (isNull(this.state.dateFrom) && isNull(this.state.dateTo)) {
            return <span />;
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
                    st => {
                        st.dateFrom = null!;
                        st.dateTo = null!;
                    }, 
                    () => {
                    this.applyQueryToHandler();
                    });
            }}
        ><i className='fa fa-remove' />
        </a>
        );
    }
    private renderLabelPanel (): JSX.Element {
        let lbl: SelectedDateQueryLabel = isNull(this.props.labels) ? GridDateFromToSearchEntryPanel.DEFAULT_LABEL : this.props.labels!;
        let cntPnls: any [] = [] ; 
        if  ( !isNull(this.state.dateFrom)) {
            cntPnls.push( (
            <GridDateFromToSearchEntryPanelDateLabel
                key='dt_from'
                prefix={lbl.from}
                dateLabel={DateUtils.formatDate(this.state.dateFrom)}
                onRemoveClickHandler={() => {
                        this.setStateHelper( 
                            st => st.dateFrom = null! , 
                            this.applyQueryToHandler); 
                }}
            />));
        }
        if ( !isNull(this.state.dateTo)) {
            cntPnls.push((
            <GridDateFromToSearchEntryPanelDateLabel
                key='dt_to'
                prefix={lbl.to}
                dateLabel={DateUtils.formatDate(this.state.dateTo)}
                onRemoveClickHandler={() => {
                    this.setStateHelper( 
                        st => st.dateTo = null!  , this.applyQueryToHandler); 
                }}
            />));
        }
        return (<span style={{textOverflow : 'ellipsis'}}>{cntPnls}</span>) ; 
    }

    private onSelectClick: (evt: any) => any = (evt: any) => {
        console.log('[GridDateFromToSearchEntryPanel#onSelectClick] handler pilih data');
        if (!isNull(evt.stopPropagation)) {
            evt.stopPropagation();
        }
        if (!isNull(evt.preventDefault)) {
            evt.preventDefault();
        }
        this.setStateHelper(
            st => {
                st.dateFrom = st.dateFromTemp;
                st.dateTo = st.dateToTemp;
                st.state = 'normal';
            }, 
            () => {
                if (!isNull(this.closePopupCommand)) {
                    this.closePopupCommand().then(d => {
                        this.closePopupCommand = null!;
                    }).catch(exc => {
                        this.closePopupCommand = null!;
                        console.error('[GridDateFromToSearchEntryPanel#renderSelectorPanel] error close panel : ', exc);
                    });

                }
                this.applyQueryToHandler();
            });
    }

    private onCloseClick: (evt: any) => any = (evt: any) => {
        console.log('tes click ok');
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
                console.error('[GridDateFromToSearchEntryPanel#renderSelectorPanel] error close panel : ', exc);
            });

        }
    }
    private renderSelectorPanel(): JSX.Element {
        let swapMetadata: any = this.props.searchDef.additonalControlMetadata;
        let df: GridSearchData.DateFromToMetadata = swapMetadata;
        if (isNull(df)) {
            df = {
                changeHandler: null!,
                className: null!
            };
        }
        let dtFromMetadata: GridSearchData.DateQueryMetadata = df.dateFromMetadata!;
        let dtToMetadata: GridSearchData.DateQueryMetadata = df.dateToMetadata!;
        if (isNull(dtFromMetadata)) {
            dtFromMetadata = {};
        }
        if (isNull(dtToMetadata)) {
            dtToMetadata = {};
        }

        let lbl: SelectedDateQueryLabel = isNull(this.props.labels) ? GridDateFromToSearchEntryPanel.DEFAULT_LABEL : this.props.labels!;
        this.dynamicKeyIndexer++;
        let lblTitle: string = GridDateFromToSearchEntryPanel.TEMPLATE_TITLE_HEADER_SEARCH.split(':title').join('<i>' + this.props.columnTitle + '</i>' ) ; 
        return (
        <div style={{ paddingTop: '20px', paddingLeft: '10px', paddingRight: '10px' }}>
            <div className='well'>
                <table key={'panel_dynamic_' + this.dynamicKeyIndexer}>
                    <tbody>
                        <tr>
                            <td colSpan={4}><strong ><span dangerouslySetInnerHTML={{__html : lblTitle}}/> </strong></td>
                        </tr>
                        <tr>
                            <td>&nbsp;{lbl.from}&nbsp;</td>
                            <td>
                                <DatePickerWrapper
                                    initalValue={this.state.dateFrom}
                                    tabIndex={1}
                                    maxDate={dtFromMetadata.maxDate}
                                    minMate={dtFromMetadata.minMate}
                                    className={df.className}
                                    datesDisabled={dtFromMetadata.datesDisabled}
                                    dateFormatter={dtFromMetadata.dateFormatter}
                                    changeHandler={val => {
                                        this.setStateHelper(st => { 
                                            st.dateFromTemp = val  ; 
                                            
                                        } );
                                    }} 
                                />
                            </td>
                            <td>&nbsp;{lbl.to}&nbsp;</td>
                            <td>
                                <DatePickerWrapper
                                    initalValue={this.state.dateTo}
                                    tabIndex={2}
                                    maxDate={dtToMetadata.maxDate}
                                    minMate={dtToMetadata.minMate}
                                    className={df.className}
                                    datesDisabled={dtToMetadata.datesDisabled}
                                    dateFormatter={dtToMetadata.dateFormatter}
                                    changeHandler={val => {
                                        this.setStateHelper(st => st.dateToTemp = val);
                                    }} 
                                /></td>
                        </tr>

                        <tr>
                            <td colSpan={4}>
                                <a onClick={this.onSelectClick}><i className='fa fa-check-circle-o' /></a>&nbsp;
                        <a onClick={this.onCloseClick}><i className='fa fa-close' /></a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div> 
        );
    }

    /**
     * ini untuk propagete query ke query invoker
     */
    private applyQueryToHandler: () => any =  () => {
        if (isNull(this.state.dateFrom) && isNull(this.state.dateTo)) {
            if (this.searchOnJoin) {
                this.props.removeQueryOnIncludeModel(this.props.searchDef.searchOnJoinDefinition!.modelName, this.props.searchDef.queryField, this.props.searchDef.searchOnJoinDefinition!.includeAs);
            } else {
                this.props.removeQueryHandler(this.props.searchDef.queryField);
            }
        } else {
            let queryVal: any = null;
            if (!isNull(this.state.dateFrom) && !isNull(this.state.dateTo)) {
                queryVal = {
                    $between: [
                        makeIsoDateTime(geneteDate00Hour(this.state.dateFrom)),
                        makeIsoDateTime(geneteDateMaxedHour(this.state.dateTo))
                    ]
                };
            } else if (isNull(this.state.dateFrom) && !isNull(this.state.dateTo)) {
                queryVal = { $lte: geneteDateMaxedHour(this.state.dateTo) };
            } else {
                queryVal = { $gte: geneteDate00Hour(this.state.dateFrom) };
            }
            if (this.searchOnJoin) {
                this.props.assignQueryOnIncludeModel(this.props.searchDef.searchOnJoinDefinition!.modelName, this.props.searchDef.queryField, queryVal, isNull(this.props!.searchDef!.searchOnJoinDefinition!.useInnerJoin) ? false : this.props.searchDef!.searchOnJoinDefinition!.useInnerJoin!, this.props.searchDef!.searchOnJoinDefinition!.includeAs);
            } else {
                this.props.assignQueryHandler(this.props.searchDef.queryField, queryVal);
            }
        }
        this.props.navigate(0);
    }

}