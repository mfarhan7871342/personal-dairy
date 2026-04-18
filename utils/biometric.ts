import * as LocalAuthentication from 'expo-local-authentication';

export async function authenticateBiometric(promptMessage: string): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, fallbackLabel: 'Use PIN' });
    return result.success;
  } catch {
    return false;
  }
}

export async function isBiometricAvailable(): Promise<boolean> {
  try {
    return await LocalAuthentication.hasHardwareAsync();
  } catch {
    return false;
  }
}
