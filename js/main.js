async function getCurrencies (dateQuery = 'https://www.cbr-xml-daily.ru/daily_json.js') {
  const response = await fetch(dateQuery);
  const data = await response.json();
  // console.log(data);
  const result = await data;
  
  rates.date = result.Date;
  rates.USD = result.Valute.USD;
  rates.EUR = result.Valute.EUR;
  rates.GBP = result.Valute.GBP;

  previousURL = result.PreviousURL;
}

let previousURL;
var pattern = /^[-0-9.,]+$/;
const currentDate = new Date();
let selectedDate = new Date();
let isErrorValidity = false;

const orderType = {
  LEFT: `LEFT`,
  RIGHT: `RIGHT`
};

const rates = {};
let currentAction = {};
const history = [];

const bodyElement = document.body;
const cashInput = bodyElement.querySelector(`.sums__cash`);
const cashType = bodyElement.querySelector(`.sums__cash-type`);
const exchangedInput = bodyElement.querySelector(`.sums__exchanged`);
const exchangedType = bodyElement.querySelector(`.sums__exchanged-type`);

const sumsSubmit = bodyElement.querySelector(`.sums`);

const datePicker = bodyElement.querySelector(`.flatpickr__setdate`);
datePicker.valueAsDate = currentDate;

datePicker.addEventListener("change", ({target}) => {
  selectedDate = target.value;
  console.log(`currentDate: `, currentDate);
  console.log(`selectedDate: `, selectedDate);
  // if(currentDate > selectedDate) {
  //   console.log(`Новая дата меньше`);
  // }
  // getCurrencies(previousURL);
})

getCurrencies();

const setAppearanceOfHashtagField = () => {
  if (isErrorValidity) {
    cashInput.classList.add(`sums__input--error`);
    exchangedInput.classList.add(`sums__input--error`);
  } else {
    cashInput.classList.remove(`sums__input--error`);
    exchangedInput.classList.remove(`sums__input--error`);
  }
};

const convert = (selfInput, otherInput, selfValuteType, otherValuteType, type) => {
  isErrorValidity = false;
  setAppearanceOfHashtagField();
  const selfType = selfValuteType.options[selfValuteType.selectedIndex].value;
  const otherType = otherValuteType.options[otherValuteType.selectedIndex].value;

  const cash = Number(selfInput.value);
  const rur = cash / (rates[otherType] ? rates[otherType].Value : 1);
  const converted = Math.floor(rur * (rates[selfType] ? rates[selfType].Value : 1) * 100) / 100;

  otherInput.value = converted;

  currentAction = (type === orderType.LEFT) 
    ? {...currentAction, currentDate, firstCash: cash, firstCashType: selfType, secondCash: converted, secondCashType: otherType} 
    : {...currentAction, currentDate, firstCash: converted, firstCashType: otherType, secondCash: cash, secondCashType: selfType};
}

const onInputBlur = ({target}) => {
  if (pattern.exec(target.value)) {
    target.value = parseFloat(target.value.replace(/\,/g, '.'));
  }
}

const onInputSum = (otherInput, selfValuteType, otherValuteType,type) => (evt) => {

  convert(evt.target, otherInput, selfValuteType, otherValuteType, type)
}

const onChangeType = (selfInput, otherInput, otherValuteType, type) => (evt) => {
  convert(otherInput, selfInput, otherValuteType, evt.target, type)
}

cashInput.addEventListener("input", onInputSum(exchangedInput, cashType, exchangedType, orderType.LEFT));
exchangedInput.addEventListener("input", onInputSum(cashInput, exchangedType, cashType, orderType.RIGHT));

cashType.addEventListener("change", onChangeType(cashInput, exchangedInput, exchangedType, orderType.RIGHT));
exchangedType.addEventListener("change", onChangeType(exchangedInput, cashInput, cashType, orderType.LEFT));

cashInput.addEventListener("blur", onInputBlur);
exchangedInput.addEventListener("blur", onInputBlur);

sumsSubmit.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (!Number(cashInput.value) && !Number(exchangedInput.value)) {
    isErrorValidity = true;
    setAppearanceOfHashtagField();
    return;
  }

  history.push(currentAction);
  console.log(history);
  if (history.length > 10) {
    history.shift();
  }
});

// currentAction: позволяет отслеживать текущие данные. Содержит:
// - выбранную дату, данные инпутов и селектов
// getCurrencies: запрос на сервер для получения текущего курса валют:
// - по умолчанию запрос идёт по стандартному адресу. Либо, на прошедшую дату
// setAppearanceOfHashtagField: проверяет isErrorValidity, если true, устанавливает красную рамку
// convert получает:
// - инпут, на котором произошло событие,
// - инпут, в котором необходимо менять сумму,
// - два селекта с типом национальной валюты,
// - тип формирования объекта currentAction,
// - формирует currentAction