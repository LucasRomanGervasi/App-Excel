import React, { useEffect, useState } from "react";

function View({ excelData, title }) {
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
                            )
                            : individualExcelData[key]?.length !== undefined? (
                          <td className="excelTableValores" key={key}>
                             {individualExcelData[key].includes(".") && !isNaN(parseFloat(individualExcelData[key]))  ?
                            <p style={{textAlign: "right"}}> {individualExcelData[key]}</p> :
                            <p style={{textAlign: "center"}}> {individualExcelData[key]}</p> 
                          }
                          </td>
                        ):null
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          null
        )}
      </div>
    )
}

export default View;

