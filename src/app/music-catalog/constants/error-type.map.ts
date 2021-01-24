import { TwoWayMap } from '../utilities/two-way-map.utility';

export const errorTypeMap = new TwoWayMap({
    0: 'Http error',
    1: 'System error',
    2: 'Authorisation error',
    3: 'Database error',
    4: 'Validation error',
});
