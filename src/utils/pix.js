// Gera o payload padrao "Pix Copia e Cola" (EMV/BR Code), o mesmo formato usado
// pelos bancos para chave estatica. Especificacao publica do Banco Central.

function tlv(id, value) {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function stripAccents(str) {
  return str.normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

export function buildPixPayload({ key, name, city, txid = "***", amount = null }) {
  const merchantAccount =
    tlv("00", "br.gov.bcb.pix") +
    tlv("01", key);

  const cleanName = stripAccents(name).toUpperCase().slice(0, 25);
  const cleanCity = stripAccents(city).toUpperCase().slice(0, 15);

  let payload =
    tlv("00", "01") +
    tlv("26", merchantAccount) +
    tlv("52", "0000") +
    tlv("53", "986") +
    (amount ? tlv("54", Number(amount).toFixed(2)) : "") +
    tlv("58", "BR") +
    tlv("59", cleanName) +
    tlv("60", cleanCity) +
    tlv("62", tlv("05", txid));

  payload += "6304";
  return payload + crc16(payload);
}
