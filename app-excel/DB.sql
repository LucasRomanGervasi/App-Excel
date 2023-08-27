use appexcel;

-- Tabla "usuario"
CREATE TABLE usuario (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    usuario varchar(255),
    email varchar(255)
);

-- Tabla "empresa"
CREATE TABLE empresa (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    empresa varchar(255),
    rut varchar(255)
);

-- Tabla "archivo"
CREATE TABLE archivo (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    idusuario bigint,
    idempresa bigint,
    archivo varchar(255),
    tipo varchar(255),
    fechadesde datetime,
    fechahasta datetime,
    fechaupload datetime
);

-- Tabla "impo_compraventa"
CREATE TABLE impo_compraventa (
    id bigint PRIMARY KEY AUTO_INCREMENT,
    idarchivo bigint,
    fecha datetime,
    tipoCFE varchar(255),
    serie varchar(255),
    numero varchar(255),
    RUTemisor varchar(255),
    moneda varchar(255),
    montoneto decimal(18, 2),
    montoiva decimal(18, 2),
    montototal decimal(18, 2),
    montoretper decimal(18, 2),
    montocredfiscal decimal(18, 2)
);


