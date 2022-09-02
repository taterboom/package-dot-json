import Head from "next/head"
import styles from "../styles/Home.module.css"
import React from "react"
import Image from "next/image"
import { isExtension } from "../utils/env"

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <a
        href={
          isExtension
            ? "https://package.json.taterbomb.top"
            : "https://www.github.com/xue1206/package-dot-json"
        }
        target="_blank"
        rel="noreferrer"
      >
        <Image src={isExtension ? "./logo.png" : "/logo.png"} alt="logo" width={66} height={24} />
      </a>
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
