import * as React from 'react';
import { isNull } from 'core-client-commons/index';
import { BaseHtmlComponent } from '../BaseHtmlComponent'; 

export interface GridDateFromToSearchEntryPanelDateLabelProps {
    /**
     * label prefix dari label
     */
    prefix: string ; 

    /**
     * label date untuk di render
     */
    dateLabel: string ; 

    onRemoveClickHandler: () => any ; 

} 
export interface GridDateFromToSearchEntryPanelDateLabelState {
    hoveredOnLabel: boolean ; 
} 
/**
 * panel untuk label tgl yang di pilih saat ini 
 */
export class GridDateFromToSearchEntryPanelDateLabel extends BaseHtmlComponent<GridDateFromToSearchEntryPanelDateLabelProps , GridDateFromToSearchEntryPanelDateLabelState> {
    /**
     * field pada props untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_PROPS: string[] = ['dateLabel'];
    /**
     * field yang di compare pada state untuk di check ada perubahan atau tidak
     */
    static FIELD_COMPARED_STATE: string[] = ['hoveredOnLabel'];
    constructor( props: GridDateFromToSearchEntryPanelDateLabelProps) {
        super(props) ; 
        this.state  = {
            hoveredOnLabel : false  
        };
    }
    shouldComponentUpdate(nextProps: GridDateFromToSearchEntryPanelDateLabelProps, nextState: GridDateFromToSearchEntryPanelDateLabelState): boolean {
        if (this.compareForShouldComponentUpdateStateOrProp(GridDateFromToSearchEntryPanelDateLabel.FIELD_COMPARED_PROPS, this.props, nextProps)) {
            return true;
        }
        if (this.compareForShouldComponentUpdateStateOrProp(GridDateFromToSearchEntryPanelDateLabel.FIELD_COMPARED_STATE, this.state, nextState)) {
            return true;
        }
        return false;
    }
    render (): JSX.Element {
        if ( isNull(this.props.dateLabel) || this.props.dateLabel.length === 0 ) {
            return <input type='hidden'/> ; 
        }
        return (
        <span>{this.props.prefix}&nbsp; 
            <span 
                className={this.state.hoveredOnLabel ?    'label label-default' :  'label label-primary'}
                onMouseEnter={this.onMouseEnterLabel}
                onMouseLeave={this.onMouseLeaveLabel}
            >{this.props.dateLabel}
                <span 
                    className='badge' 
                    onClick={(evt: any ) => {
                        if (!isNull(evt.stopPropagation)) {
                            evt.stopPropagation();
                        }
                        if (!isNull(evt.preventDefault)) {
                            evt.preventDefault();
                        }
                        this.props.onRemoveClickHandler(); 
                    }} 
                    style={{ display : this.state.hoveredOnLabel ? '' : 'none'}}
                >x
                </span>
            </span>
        </span>) ; 
    }
    private onMouseEnterLabel: () => any = () => {
        this.setStateHelper( st => st.hoveredOnLabel = !st.hoveredOnLabel );
    }
    private onMouseLeaveLabel: () => any = () => {
        this.setStateHelper( st => st.hoveredOnLabel = !st.hoveredOnLabel );
    } 
}