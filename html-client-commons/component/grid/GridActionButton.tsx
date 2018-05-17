import * as React from "react" ;
import { GridButtonProps } from './SimpleGridMetadata';
import { isNull, BaseComponent } from 'core-client-commons';

/**
 * ini tidak secara fisik membuat element. ini cuma untuk di pass ke dalam grid/ column. column yang mandatory berjewajiban membuat action column
 */
export class GridActionButton<DATA> extends BaseComponent<GridButtonProps<DATA> , any > {
   
    render() {
        return (
        <input 
            key={'grid-action-button' + this.props.label} 
            id={'grid-action-button' +  ( isNull(this.props.label) ? '' :  this.props.label.split(' ').join('_'))} 
            type='hidden'
        />);
    }
}