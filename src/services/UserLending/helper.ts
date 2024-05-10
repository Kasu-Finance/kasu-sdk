import { UserRequestEventType } from './subgraph-types';

const USER_REQUEST_EVENT_MAP = {
    DepositAccepted: 'Accepted',
    DepositCancelled: 'Cancelled',
    DepositIncreased: 'Increased',
    DepositInitiated: 'Initiated',
    DepositRejected: 'Rejected',
    WithdrawalAccepted: 'Accepted',
    WithdrawalCancelled: 'Cancelled',
    WithdrawalIncreased: 'Increased',
    WithdrawalInitiated: 'Initiated',
} as const;

export const mapUserRequestEventType = (requestType: UserRequestEventType): "Initiated" | "Increased" | "Cancelled" | "Accepted" | "Rejected" => {
    return USER_REQUEST_EVENT_MAP[requestType];
};