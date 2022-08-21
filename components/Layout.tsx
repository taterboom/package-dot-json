import Head from "next/head"
import styles from "../styles/Home.module.css"
import React, { SVGProps } from "react"
import { IconMdiGithub } from "./icons"

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

      <footer className={styles.footer}>
        <a href="https://www.github.com/xue1206" target="_blank" rel="noreferrer">
          <IconMdiGithub />
        </a>
      </footer>
    </div>
  )
}

export default Layout
