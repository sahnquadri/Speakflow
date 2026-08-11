import type { Metadata } from "next"; import "./globals.css";
export const metadata: Metadata={title:"SpeakFlow — Spoken English Trainer",description:"Adaptive voice-first English speaking practice."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
