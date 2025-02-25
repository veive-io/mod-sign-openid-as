export function getValueFromJSON(jsonStr: string, key: string): string | null {
  let keyStr = '"' + key + '":';
  let startIndex = jsonStr.indexOf(keyStr);

  if (startIndex == -1) {
    // La chiave non è stata trovata
    return null;
  }

  startIndex += keyStr.length;

  // Salta eventuali spazi bianchi
  while (
    startIndex < jsonStr.length &&
    (jsonStr.charAt(startIndex) == ' ' ||
     jsonStr.charAt(startIndex) == '\n' ||
     jsonStr.charAt(startIndex) == '\t')
  ) {
    startIndex++;
  }

  let firstChar = jsonStr.charAt(startIndex);

  if (firstChar == '"') {
    // Il valore è una stringa
    startIndex += 1;
    let endIndex = jsonStr.indexOf('"', startIndex);

    if (endIndex == -1) {
      // Il valore della chiave non è stato trovato
      return null;
    }

    return jsonStr.substring(startIndex, endIndex);
  } else if (jsonStr.substring(startIndex, startIndex + 4) == "true") {
    // Il valore è booleano true
    return "true";
  } else if (jsonStr.substring(startIndex, startIndex + 5) == "false") {
    // Il valore è booleano false
    return "false";
  } else if ((firstChar >= '0' && firstChar <= '9') || firstChar == '-') {
    // Il valore è numerico.
    let endIndex = startIndex;
    // Estendiamo fino a quando il carattere fa parte del numero (includendo . e notazioni esponenziali)
    while (
      endIndex < jsonStr.length &&
      (
        (jsonStr.charAt(endIndex) >= '0' && jsonStr.charAt(endIndex) <= '9') ||
        jsonStr.charAt(endIndex) == '.' ||
        jsonStr.charAt(endIndex) == '-' ||
        jsonStr.charAt(endIndex) == 'e' ||
        jsonStr.charAt(endIndex) == 'E'
      )
    ) {
      endIndex++;
    }
    return jsonStr.substring(startIndex, endIndex);
  } else {
    // Tipo di valore non supportato
    return null;
  }
}


export function base64ToBase64url(input: string): string {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    let ch = input.charAt(i);
    if (ch == "+") {
      output += "-";
    } else if (ch == "/") {
      output += "_";
    } else if (ch == "=") {
      // ignora il padding
    } else {
      output += ch;
    }
  }
  return output;
}

export function uint8ArrayToHex(arr: Uint8Array): string {
  let hex: string = "";
  for (let i = 0; i < arr.length; i++) {
    // Converti ogni byte in stringa esadecimale
    let byteHex: string = arr[i].toString(16);
    // Aggiungi uno zero se necessario per avere sempre due caratteri
    if (byteHex.length == 1) {
      byteHex = "0" + byteHex;
    }
    hex += byteHex;
    // Se vuoi separare i byte con uno spazio
    if (i < arr.length - 1) {
      hex += " ";
    }
  }
  return hex;
}