import { MetamaskIcon } from '@/assets/icons';
import { EIP6963ProviderDetail } from '@/types/eip6963';
import { Provider } from '@web3-react/types';

/**
 * Returns true if the string is a RFC2397-compliant data URI
 * @see {@link https://www.rfc-editor.org/rfc/rfc2397}
 */
const isDataURI = (uri: string): boolean => {
    return /data:(image\/[-+\w.]+)(;?\w+=[-\w]+)*(;base64)?,.*/gu.test(uri);
};

const ICON_OVERRIDE_MAP: { [rdns in string]?: string } = {
    'io.metamask': MetamaskIcon().toString(), // MetaMask's provided icon has no padding
};

/** Replaces an announced provider's icon with our preferred image, when applicable */
export const applyOverrideIcon = (
    providerDetail: EIP6963ProviderDetail
): EIP6963ProviderDetail => {
    const overrideIcon = ICON_OVERRIDE_MAP[providerDetail.info.rdns];
    if (!overrideIcon) return providerDetail;

    return {
        ...providerDetail,
        info: { ...providerDetail.info, icon: overrideIcon },
    };
};

const isEip1193Provider = (value: any): value is Provider => {
    return Boolean(value.request && value.on && value.removeListener);
};

export const isEIP6963ProviderDetail = (value: any): value is EIP6963ProviderDetail => {
    return Boolean(
        value.provider &&
            isEip1193Provider(value.provider) &&
            value.info &&
            value.info.name &&
            value.info.uuid &&
            value.info.rdns &&
            value.info.icon &&
            isDataURI(value.info.icon)
    );
};

export const isCoinbaseProviderDetail = (
    providerDetail: EIP6963ProviderDetail
): boolean => {
    return providerDetail.info.rdns === 'com.coinbase.wallet';
};
