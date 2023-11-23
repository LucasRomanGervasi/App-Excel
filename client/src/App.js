import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import Compras from "./components/Compras/Compras";
import Ventas from "./components/Ventas/Ventas";
import Descargar from "./components/Descargar";

function App() {
 return(
   <div className="">
    <Router>
      <Routes>
      <Route path="/" element={<Compras/>}/>
      <Route path="/ventas" element={<Ventas/>}/>
      <Route path="/descargar" element={<Descargar/>}/>
      </Routes>
    </Router>
   </div>
 )
}

export default App;