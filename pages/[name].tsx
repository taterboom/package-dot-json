import dynamic from "next/dynamic"

const App = dynamic(() => import("../components/App"), { ssr: false })

const PackagePage = () => <App />

export default PackagePage
