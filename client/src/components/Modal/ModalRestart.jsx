import React, { useEffect, useState } from "react";
import styles from "./ModalRestart.module.css";


function ModalRestart({ reiniciar }) {

    const handleClickAccept = () => {
        reiniciar(true)
      };

    const handleClickCancel = () => {
        reiniciar(false)
    };
 

    return(
    <div className={styles.wrapper}>
        <h1 className={styles.title}>Deseas descartar los cambios y volver al inicio?</h1>
        <div className={styles.wrapperBtn}>
        <button
              className={styles.btn}
              onClick={handleClickCancel}
            >
              CANCELAR
            </button>
            <button
              className={styles.btn}
              onClick={handleClickAccept}
            >
             ACEPTAR
            </button>
        </div>
    </div>
    )
}

export default ModalRestart;
