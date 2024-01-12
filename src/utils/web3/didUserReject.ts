import { ErrorCode } from '@/constants';

import { Connection, ConnectionType } from '@/types/connectors';

const didUserReject = (connection: Connection, error: any): boolean => {
    return (
        error?.code === ErrorCode.USER_REJECTED_REQUEST ||
        (connection.type === ConnectionType.WALLET_CONNECT_V2 &&
            error?.toString?.() === ErrorCode.WC_V2_MODAL_CLOSED) ||
        (connection.type === ConnectionType.COINBASE_WALLET &&
            error?.toString?.() === ErrorCode.CB_REJECTED_REQUEST)
    );
};

export default didUserReject;
