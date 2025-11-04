'use client';

import Script from 'next/script';

export default function FHEVM() {
  return (
    <Script
      src="https://cdn.zama.org/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs"
      strategy="afterInteractive"
      onLoad={async () => {
        console.log('✅ ZamaRelayerSDK script load');

        const { initializeFheInstance } = await import('@/utils/fheClient');

        const initializeFhevm = async () => {
          try {
            await initializeFheInstance();
            // console.log('✅ FHEVM initialized!');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            console.log(error.message);
          }
        };

        initializeFhevm();
      }}
    />
  );
}
