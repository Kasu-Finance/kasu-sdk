import { UserRequestEventType } from './subgraph-types';

const USER_REQUEST_EVENT_MAP = {
    DepositAccepted: 'Accepted',
    DepositCancelled: 'Cancelled',
    DepositIncreased: 'Increased',
    DepositInitiated: 'Initiated',
    DepositRejected: 'Rejected',
    DepositReallocated: 'Reallocated',
    WithdrawalAccepted: 'Accepted',
    WithdrawalCancelled: 'Cancelled',
    WithdrawalIncreased: 'Increased',
    WithdrawalInitiated: 'Initiated',
    ImmediateWithdrawalExecuted: 'Forced',
} as const;

export const mapUserRequestEventType = (
    requestType: UserRequestEventType,
):
    | 'Initiated'
    | 'Increased'
    | 'Cancelled'
    | 'Accepted'
    | 'Rejected'
    | 'Reallocated'
    | 'Forced' => {
    return USER_REQUEST_EVENT_MAP[requestType];
};
