async function getCurrencies (dateQuery = 'https://www.cbr-xml-daily.ru/daily_json.js') {
  const response = await fetch(dateQuery);
  const data = await response.json();
  console.log(data);
  const result = await data;
  
  rates.date = result.Date;
  rates.USD = result.Valute.USD;
  rates.EUR = result.Valute.EUR;
  rates.GBP = result.Valute.GBP;

  previousURL = result.PreviousURL;
}

let previousURL;
const currentDate = new Date();
let selectedDate = new Date();

const orderType = {
  LEFT: `LEFT`,
  RIGHT: `RIGHT`
};

const rates = {};
let currentAction = {};
const history = [];

const bodyElement = document.body;
// Элементы для отображения курса валют:
const cashInput = bodyElement.querySelector(`.sums__cash`);
const cashType = bodyElement.querySelector(`.sums__cash-type`);
const exchangedInput = bodyElement.querySelector(`.sums__exchanged`);
const exchangedType = bodyElement.querySelector(`.sums__exchanged-type`);

const datePicker = bodyElement.querySelector(`.flatpickr__setdate`);
datePicker.valueAsDate = currentDate;

datePicker.addEventListener("change", (evt) => {
  selectedDate = evt.target.value;
  console.log(`currentDate: `, currentDate);
  console.log(`selectedDate: `, selectedDate);
  // if(currentDate > selectedDate) {
  //   console.log(`Новая дата меньше`);
  // }
  // getCurrencies(previousURL);
})

getCurrencies();

// Получает: 
// инпут, на котором произошло событие,
// инпут, в котором необходимо менять сумму,
// два селекта с типом национальной валюты,
// тип формирования объекта currentAction,
const convert = (selfInput, otherInput, selfValuteType, otherValuteType, type) => {
  const selfType = selfValuteType.options[selfValuteType.selectedIndex].value;
  const otherType = otherValuteType.options[otherValuteType.selectedIndex].value;
  const cash = Number(selfInput.value);
  const rur = cash / (rates[otherType] ? rates[otherType].Value : 1);
  const converted = Math.floor(rur * (rates[selfType] ? rates[selfType].Value : 1) * 100) / 100;

  otherInput.value = converted;

  currentAction = (type === orderType.LEFT) 
    ? {...currentAction, cash1: cash, selfType1: selfType, converted1: converted, otherType1: otherType} 
    : {...currentAction, cash1: converted, selfType1: otherType, converted1: cash, otherType1: selfType};
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
