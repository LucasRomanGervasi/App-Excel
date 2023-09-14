import React from "react";

function View({ excelData, title }) {
  console.log(excelData)
    return(
        <div className="view">
        {excelData ? (
          <div className="table-res">
            <h3 className="excelTitle">{title}</h3>
            <table className="table">
              <tbody className="excel">
                {excelData.map((individualExcelData, index) =>
                  index < 3 ? (
                    <tr key={index}>
                      {Object.keys(individualExcelData).map((key) => (
                        <td className="excelTable" key={key}>
                          {individualExcelData[key]}
                        </td>
                      ))}
                    </tr>
                  ) : (
                    <tr className="excelTableTitleContainer" key={index}>
                      {Object.keys(individualExcelData).map((key) =>
                        index === 3 ? (
                          <td className="excelTableTitle" key={key}>
                            {individualExcelData[key]}
                          </td>
                        ) : (
                          <td className="excelTableValores" key={key}>
                            {individualExcelData[key]}
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div>¡Aún no se ha subido ningún archivo!</div>
        )}
      </div>
    )
}

export default View;

