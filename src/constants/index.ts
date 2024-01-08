export enum ErrorCode {
    USER_REJECTED_REQUEST = 4001,
    UNAUTHORIZED = 4100,
    UNSUPPORTED_METHOD = 4200,
    DISCONNECTED = 4900,
    CHAIN_DISCONNECTED = 4901,

    // https://docs.metamask.io/guide/rpc-api.html#unrestricted-methods
    CHAIN_NOT_ADDED = 4902,
    MM_ALREADY_PENDING = -32002,

    WC_V2_MODAL_CLOSED = 'Error: Connection request reset. Please try again.',
    WC_MODAL_CLOSED = 'Error: User closed modal',
    CB_REJECTED_REQUEST = 'Error: User denied account authorization',
}
