import type { AppProps } from 'next/app';
import React from 'react';
import Head from 'next/head';

import '../../styles/globals.css';
import { RunkitEmbed } from '../RunkitEmbed';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <RunkitEmbed />
      <Component {...pageProps} />
    </>
  );
}
