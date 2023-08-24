import { useState } from "react";
import * as XLSX from 'xlsx';

function App(){
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [title, setTitle] = useState(null)
  const [excelData, setExcelData] = useState(null);
  
  //onchange event 
  const handleFile = (e) => {
    let fileTypes = ['application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv'];
    let selectedFile = e.target.files[0]; 
    if(selectedFile){
      if(selectedFile&&fileTypes.includes(selectedFile.type)){
        setTypeError(null)
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload=(e)=>{
          setExcelFile(e.target.result)
        }
    }
    else{
      setTypeError('Seleccione solo tipos de archivos de Excel');
      setExcelFile(null);
      }
    }
    else{
      console.log('Please select yout file')
    }
  }

  const handleFileSubmit=(e)=>{
    e.preventDefault();
    if(excelFile!==null ){
      const workbook = XLSX.read(excelFile, {type: 'buffer'});
      const worksheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[worksheetName]);
      const file0 = Object.keys(data[0])
      const file10 = data[3]
      const file11 = data[4]
      const A0 = Object.values(file0)
      const A10 = Object.values(file10)
      const A11 = Object.values(file11)
      if(A11.length<11){
        A11.unshift("") 
      }
      setTitle(A0[0])
      if( A0[0]==="CFE Recibidos" && A10[0]==="Fecha" && A11[0]!==""){ 
        setExcelData(data);
      }
      else{
        setTypeError("El archivo subido no es un tipo de archivo que podamos procesar, intentar nuevamente con otro archivo")
        setExcelData(null)
      }
    }
  }


  return (
    <div className="wrapper">

      <h3 className="title">Cargar Excel</h3>

      <form className="form" onSubmit={handleFileSubmit}>
        <input type="file" id="input-file" className="form-control" required onChange={handleFile} />
        {     
          typeError?(
            <button className="btn-no">SUBIR ARCHIVO</button>
            ):(
            <button type="submit" className="btn">SUBIR ARCHIVO</button>
            )     
        }
        {
          typeError&&(
            <div className="alert" role="alert">{typeError}</div> 
          )
        }
      </form>

      <h3 className="title">Vista previa</h3>
      <div className="view">
        {excelData?(
          <div className="table-res">
            <div className="table">
              <div className="excel">
                <h3 className="excelTitle" >
                  {title}
                </h3>
                {excelData.map((individualExcelData, index)=>(
                  index<3?
                  <tr key={index}>
                    {Object.keys(individualExcelData).map((key)=>(
                        <td className="excelTable" key={key}>{individualExcelData[key]}</td> 
                    ))}
                      </tr>
                      :
                      <tr key={index}>
                    {Object.keys(individualExcelData).map((key)=>(
                      index===3?
                      <td className="excelTableTitle" key={key}>{individualExcelData[key]}</td>
                      :
                      <td className="excelTableValores" key={key}>{individualExcelData[key]}</td>
                  ))}
                  </tr>
                ))}
              </div>
            </div>
          </div>
        ):(
          <div>¡Aún no se ha subido ningún archivo!</div>
        )}
    </div>

    </div>
  );
}

export default App;