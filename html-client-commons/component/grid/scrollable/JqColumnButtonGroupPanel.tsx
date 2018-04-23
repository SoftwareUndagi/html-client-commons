import * as React from 'react';
import { isNull  } from '../../../utils/index';
import { JqGridButtonProps } from './GridPanelComponent';
import { JqGridButtonPanel } from './JqGridButtonPanel';
import { BaseHtmlComponent } from '../../BaseHtmlComponent';
/**
 *
 * props untuk column button. button dalam grid. 
 */
export interface JqColumnButtonGroupPanelProps<DATA> {

    /**
     * untuk retrieve button def
     */
    buttons: JqGridButtonProps<DATA>[] ;
    /**
     * data untuk grid
     */
    data: DATA ; 
    /**
     * flag selected
     */
    selectedFlag: boolean ; 
    /**
     * index data dalam grid
     */
    rowIndex: number ;
    /**
     * requestor grid state
     * @param rowIndex index dari data dalam row
     */
    requestGridStateData: ( rowIndex: number ) => any  ;
    /**
     * method untuk memaksa grid state update
     */
    applyGridState: () => any ; 
}
/**
 * panel untuk button columns. wrapper panel button group
 */
export class JqColumnButtonGroupPanel<DATA>  extends BaseHtmlComponent<JqColumnButtonGroupPanelProps<DATA> , any > {

    render (): JSX.Element {
        let btns: any[] = []; 
        let idx: number = 0 ;  
        for ( let df of this.props.buttons ) {
            if (!isNull(df.renderButtonOnColumnFlag) && !df.renderButtonOnColumnFlag ) {
                continue ; 
            }
            if ( !isNull( df.renderButtonOnColumnFlag) && df.renderButtonOnColumnFlag) {
                let sBtn: any = df ; 
                let sData: any = this.props.data ; 
                if ( !isNull(df.doNotRenderIfCustomEvaluator)) {
                    if ( df.doNotRenderIfCustomEvaluator!(this.props.data)) {
                        continue ; 
                    }
                }

                btns.push( (
                <JqGridButtonPanel 
                    applyGridState={this.props.applyGridState}
                    requestGridStateData={this.props.requestGridStateData}
                    key={'btn_' + this.props.rowIndex + idx}
                    rowIndex={this.props.rowIndex}
                    data={sData}
                    button={sBtn}
                />));
                btns.push(<span key={'spacer_' + idx} style={{float : 'left' , width : '2px'}}>&nbsp;</span>);
                idx++;
            }
        } 
        return (<div style={{marginLeft: '8px'}}>{btns}</div>);
    }

}