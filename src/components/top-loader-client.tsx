"use client"

import NextTopLoader from "nextjs-toploader"

export function TopLoaderClient() {
  return (
    <NextTopLoader
      initialPosition={0.15}
      shadow="0 0 10px #000, 0 0 5px #000"
      height={4}
    />
  )
}
