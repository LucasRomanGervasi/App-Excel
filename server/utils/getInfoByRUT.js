// import forge from 'node-forge'
// import { readFileSync } from 'fs'
// import { Client, createClient, WSSecurityCert } from 'soap'

// /**
//  * @param {string} url
//  * @param {any} options
//  * @returns {Promise<Client>}
//  */
// const crearCliente = async (url, options) => {
//   const cliente = await new Promise((resolve, reject) => {
//     createClient(url, options, (err, client) => {
//       if (err) reject(err)
//       else resolve(client)
//     })
//   })

//   const _xmlToObject = cliente.wsdl.xmlToObject.bind(cliente.wsdl)

//   cliente.wsdl.xmlToObject = function (body) {
//     body = body
//       .replace(/WS_/g, '')
//       .replace(/[\n|\t]/g, '')
//       .replace(/&lt;/g, '<')

//     const innerBody = /<Data>(.+?)<\/Data>/.exec(body)

//     body = body
//       .replace(/<Data>.+?<\/Data>/, '<Data></Data>')
//       .replace(/<Mensajes>.+?<\/Mensajes>/, '<Mensajes></Mensajes>')

//     cliente.emit('inner', innerBody?.[1], _xmlToObject)

//     return _xmlToObject(body)
//   }

//   return cliente
// }

// const retornaCertificado = (pfxPath, password) => {
//   const pfxFile = readFileSync(pfxPath)

//   const p12Der = forge.util.decode64(pfxFile.toString('base64'))
//   const p12Asn1 = forge.asn1.fromDer(p12Der)
//   const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)

//   const keyObj = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0]
//   const privateKey = forge.pki.privateKeyToPem(keyObj.key)

//   const certObj = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0]
//   const certificate = forge.pki.certificateToPem(certObj.cert)

//   return { privateKey, certificate }
// }

// const setClientSecurity = (cliente, certPath, password) => {
//   const { privateKey, certificate } = retornaCertificado(certPath, password)
//   cliente.setSecurity(new WSSecurityCert(privateKey, certificate, password))
// }