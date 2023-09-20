var request = require("request");
var DOMParser = require("xmldom").DOMParser;

const query = (RUTemisor, elementToParse) => {
  xml = `<soapenv:Envelope xmlns:cva="CVA_FE" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header><wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-
  wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wsswssecurity-utility-1.0.xsd"><ds:Signature Id="SIG-61257991E53D68CB9A152147347136230" 
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:SignedInfo><ds:CanonicalizationMethod 
  Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"><ec:InclusiveNamespaces PrefixList="cva soapenv"
  xmlns:ec="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:CanonicalizationMethod><ds:SignatureMethod 
  Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/><ds:Reference URI="#id61257991E53D68CB9A152147347136129"><ds:Transforms><ds:Transform 
  Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"><ec:InclusiveNamespaces PrefixList="cva" 
  xmlns:ec="http://www.w3.org/2001/10/xml-exc-c14n#"/></ds:Transform></ds:Transforms><ds:DigestMethod 
  Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><ds:DigestValue>GQn4RcOwejDURe7QMVu0+E2j+II=</ds
  :DigestValue></ds:Reference></ds:SignedInfo><ds:SignatureValue>RliD/BGF9lr1SDB3aRrDQKeTgzeBGu+uNwvNy
  DJwr0noDFs57GDk+yLc6T7o73HrDKPo6FlW7lnh
  X3DggvWKfuR6kiPFF1NeD+dJkRX7MM/kahOr6byI0H1xxHRPmDMO75bXGyytmIb6G54a9ae/+FFa
  Khypt02RDpj+wtIygHXjf+0UXaWCRk9CApiQQgZ79CZ54pBb9oKOLhA4Il/cNaVhDzqcWryTbdj0
  yuoF9M+oTNTJom3N4FnTOlHzWtLCO6WwbfBN3REG62UUScG9LbDdjIJPXgaJ0Eb0bix+VIyrVCRc
  emd293yx7gXyaiFK8thFRiyHfhJAe/eQr//Vsg==</ds:SignatureValue><ds:KeyInfo Id="KI61257991E53D68CB9A152147347136127"><wsse:SecurityTokenReference wsu:Id="STR61257991E53D68CB9A152147347136128"><wsse:KeyIdentifier EncodingType="http://docs.oasisopen.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary" 
  ValueType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile1.0#X509v3">MIIDDjCCAfagAwIBAgIEWqqWjTANBgkqhkiG9w0BAQsFADBJMQswCQYDVQQGEwJVWTEMMAoGA1UECgwDREdJMQww
  CgYDVQQLDANSVVQxHjAcBgNVBAMMFXBydWViYS5ydXQuZGdpLmd1Yi51eTAeFw0xODAzMTUxNTUxNDFaFw0xODA2MTUxNTUxNDFa
  MEkxCzAJBgNVBAYTAlVZMQwwCgYDVQQKDANER0kxDDAKBgNVBAsMA1JVVDEeMBwGA1UEAwwVcHJ1ZWJhLnJ1dC5kZ2kuZ3ViLnV5
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu/EJtuJ5lKiYiie3uTex4uuaubSqIra6Y/oVrhtHO5smHT3lu6VHpCtQ
  8kVXi/VZdOeMqLeq38FFSI2pDMidgathO6cakM4u+yo7UeT0to8W8Eq8hQtd7RzmZLVsoL0rjtQSHjVKjax+aq5L588mfmycDkKR
  1zCfBaDhnkCvAiWs/
  +apMMZ1cVPgHkVXucuM7LVUpFrPbZdjR5x5wOJOEUe1yvz5i9I8FITIpMytO/WiCfhTjbu6gpxQph6u+gzTxq/o8GfceXArxPr4b
  TxL6tiWDBxSLKWcP6qB2xf+jE8P6m9xl1hWxr1m26ZgTbNUZUFSrUy+qkyBXaytxh9RdwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBA
  QAe/NL1+yl/lz9pS0x88fx1q6kvpw0YyJEHwALJX0QqcN/k2FEcHrTNm+SjJM2ilN1Lnp3Me4FfOV9g6pcpAlw7GNfFp7n/DdTe7
  wWCzIVmjCjloO/mvu93UOwOIF4LhTDCmduR5b61JAPdtEfO+UY4pKXBNLaPxlgbKmiqWHA8gaj+yV5qy9WiGSudfPHO03YMD8Aee
  YDB24sNiNpATj5VTbvxZUSh0LymSFHzYvJWj+ypbJGVTqtWmTCbuYdzjPCz5PiXtDxGAW14mdeO5cE7DRYzifl/q4WaSbgwwQ/co
  YRj/Q7OAb+o0QCUTYJEiCDKdVlw84Qo+RaM8G5rBa3R</wsse:KeyIdentifier></wsse:SecurityTokenReference></ds:K
  eyInfo></ds:Signature></wsse:Security></soapenv:Header>
  <soapenv:Body wsu:Id="id-61257991E53D68CB9A152147347136129" xmlns:wsu="http://docs.oasisopen.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
  <cva:CVA_WS.Execute>
  <cva:Ruc>${RUTemisor}</cva:Ruc>
  </cva:CVA_WS.Execute>
  </soapenv:Body>
  </soapenv:Envelope>`

  options = {
    method: "POST",
    url: "https://www.w3schools.com/xml/tempconvert.asmx",
    headers: {
      'Content-Type': 'text/xml'
    },
    body: xml
  };
  return new Promise((resolve, reject) => {
    request(options, function(error, response) {
      if (error) {
        reject(new Error(error)); // reject instead of throwing, handle with `catch`
        return;
      }
      text = response.body;
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(text, "text/xml");
      xmlResult = xmlDoc.getElementsByTagName(`${elementToParse}`)[0]
        .childNodes[0].nodeValue;
      resolve(xmlResult);
    });
  });
};
exports.query = query