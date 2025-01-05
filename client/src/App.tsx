import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import _404 from "./pages/_404";
import ServerWarmup from "./components/ServerWarmup";

function App() {

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={1200}
        hideProgressBar={false}
        newestOnTop={false}
        theme="dark"
        closeOnClick
        rtl={false}
        pauseOnHover
        limit={2}
      />
      <ServerWarmup url={`${import.meta.env.VITE_API_URL}/user/getjson`} />
      <Router>
        <div className="bg-transparent font-inter"> </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<_404 />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;