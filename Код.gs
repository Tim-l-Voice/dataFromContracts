function doRedirect() {
  return HtmlService.createHtmlOutputFromFile("back");
}

function carPrice(numPark, typeCar) {
    if (numPark == 9 && typeCar == "Мотоцикл") {
      return '1500';
    } else if ([2, 3, 4, 6, 11].includes(numPark) && typeCar == "Мотоцикл") {
      return '2500';
    } else if (numPark == 9 && ["Легковой", "Прицеп"].includes(typeCar)) {
      return '2500';
    } else if (numPark == 9 && typeCar == "Коммерция") {
      return '3000';
    } else if ([2, 4].includes(numPark) && ["Легковой", "Прицеп"].includes(typeCar)) {
      return '3500';
    } else if ([3, 6, 11].includes(numPark) && ["Легковой", "Прицеп"].includes(typeCar)) {
      return '3700';
    } else if ([1, 7, 8].includes(numPark) && ["Легковой", "Прицеп", "Мотоцикл"].includes(typeCar)) {
      return '3800';
    } else if ([2, 3, 4, 6, 11].includes(numPark) && typeCar == "Коммерция") {
      return '4000';
    } else if ([1, 7, 8].includes(numPark) && typeCar == "Коммерция") {
      return '4500';
    } else if ([2, 3, 4, 6, 9, 11].includes(numPark) && typeCar == "Спецтехника") {
      return '4500';
    }
    return `${numPark} ${typeCar}`;
}

function decode(value) {
  if (!(typeof value === 'number') || !isFinite(value)) {
    return decodeURI(value).replace(/[+]/g, " ").replace(/0x2e/g, '.');
  }

  return value;
}

function doPost(e) {
    const lock = LockService.getScriptLock()
    lock.tryLock(10000)

    const fields = ["fio", "tel", "numCarState", "numPark", "numPlace", "typeCar"]

    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const data = e.postData.contents;

      const params = {};
      data.split('&').forEach(s => {
        const [key, value] = s.split('=');
        params[key] = value;
      });

      if (params["withoutPlace"]) {
        params["numPlace"] = "Без места";
      }

      const row = []

      row.push(`${decode(params["numPlace"])}/${params["numPark"]}/${new Date().getFullYear()}`)
      row.push(new Date().toLocaleDateString());

      for (const field of fields) {
        row.push(decode(params[field]));
      }

      row.push(carPrice(+params["numPark"], decode(params["typeCar"])));
      row.push(decode(params["reference"]));

      sheet.appendRow(row);
      const lastRowIndex = sheet.getLastRow();
      sheet.insertRowAfter(lastRowIndex);

      return HtmlService.createTemplateFromFile("back").evaluate();
    }

    catch (e) {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
        .setMimeType(ContentService.MimeType.JSON)
    }

    finally {
      lock.releaseLock()
    }
}

function doGet(request) {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}