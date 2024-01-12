import { Provider } from '@web3-react/types';

import { EIP6963_PROVIDER_MANAGER } from './eip6963manager';

import { EIP6963ProviderDetail } from '@/types/eip6963';

type Listener = (...args: any[]) => void;

export class EIP6963Provider implements Provider {
    currentProviderDetail?: EIP6963ProviderDetail;

    // Stores stable references to proxy listeners to prevent memory leaks
    private readonly proxyListeners: {
        [eventName: string | symbol]: Listener[];
    } = {};

    async request(args: any): Promise<unknown> {
        return this.currentProviderDetail?.provider.request(args);
    }

    on(eventName: string, listener: Listener): this {
        if (!this.proxyListeners[eventName]) {
            this.proxyListeners[eventName] = [];
        }
        this.proxyListeners[eventName].push(listener);
        this.currentProviderDetail?.provider.on(eventName, listener);
        return this;
    }

    removeListener(eventName: string | symbol, listener: Listener): this {
        this.currentProviderDetail?.provider.removeListener(eventName, listener);

        if (this.proxyListeners[eventName]) {
            const index = this.proxyListeners[eventName]?.indexOf(listener);
            if (index !== -1) {
                // Splicing is used since proxyListeners must be referentially stable
                this.proxyListeners[eventName]?.splice(index, 1);
            }
        }
        return this;
    }

    /** Switches which extension's provider is used based on given rdns. */
    setCurrentProvider(rdns: string) {
        const oldProvider = this.currentProviderDetail;
        const newProvider = (this.currentProviderDetail =
            EIP6963_PROVIDER_MANAGER.map.get(rdns));

        for (const eventName in this.proxyListeners) {
            // proxyListener must be referentially stable to prevent memory leaks
            // pull them from proxyListeners to keep them stable
            for (const proxyListener of this.proxyListeners[eventName]) {
                oldProvider?.provider.removeListener(eventName, proxyListener);
                newProvider?.provider.on(eventName, proxyListener);
            }
        }
    }
}
