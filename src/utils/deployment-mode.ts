import { SdkConfig } from '../sdk-config';

/**
 * Check if the SDK is configured for a Lite deployment.
 * Lite deployments don't have KSU token, locking, or loyalty features.
 */
export function isLiteDeployment(config: SdkConfig): boolean {
    return config.isLiteDeployment;
}
