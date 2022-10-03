import Head from "next/head"
import styles from "../styles/Home.module.css"
import React from "react"
import Image from "next/image"
import { isExtension } from "../utils/env"
import {
  MdiEmailArrowRightOutline,
  PhGoogleChromeLogo,
  PhTwitterLogo,
  TablerBrandGithub,
} from "./icons"

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="inline-flex justify-between items-center mx-auto gap-12">
        <div>
          <a
            href="https://package.json.taterbomb.top"
            {...(isExtension
              ? {
                  target: "_blank",
                  rel: "noreferrer",
                }
              : {})}
          >
            <Image
              src={isExtension ? "./logo.png" : "/logo.png"}
              alt="logo"
              width={66}
              height={24}
            />
          </a>
        </div>
        {!isExtension && (
          <div className="flex items-center gap-2 opacity-70">
            <a href="/desc" className=" text-sm underline">
              doc
            </a>
            <a
              href="https://chrome.google.com/webstore/detail/pdj/edgpjjbejcjkgnlnehoballnhokglenj"
              target="_blank"
              rel="noreferrer"
            >
              <PhGoogleChromeLogo />
            </a>
            <a
              href="https://github.com/taterbomb/package-dot-json"
              target="_blank"
              rel="noreferrer"
            >
              <TablerBrandGithub />
            </a>
            <a href="https://twitter.com/didan64037534" target="_blank" rel="noreferrer">
              <PhTwitterLogo />
            </a>
            <a href="mailto:xuebagod@gmail.com" target="_blank" rel="noreferrer">
              <MdiEmailArrowRightOutline />
            </a>
          </div>
        )}
      </div>
    </footer>
  )
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>package overview</title>
        <meta name="description" content="package json overview, package dependencies overview" />
        <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>{children}</main>

      <Footer></Footer>
    </div>
  )
}

export default Layout
