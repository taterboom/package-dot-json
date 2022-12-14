import dynamic from "next/dynamic"

const App = dynamic(() => import("../components/App"), { ssr: false })

const Home = () => <App />

export default Home
