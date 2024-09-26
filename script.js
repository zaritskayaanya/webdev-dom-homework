let age = 10;
console.log(age);
let up = 20;
console.log(up);
let date = ('Дата выхода Iphone1 20.06.2007');
console.log(date);
let namejs = ('создатель js Brendan Eich');
console.log(namejs);

let addition = 10;
let additionup = 2;
let result = addition + additionup ;
console.log(result);

let difference = 10;
let differencebot = 2;
let result2 = difference - differencebot;
console.log(result2);

let divide = 10;
let dividebot = 2;
let result3 = divide / dividebot;
console.log(result3);

let i = 2**5;
console.log(i);

let a = 9;
let b = 2;
let x = 9 / 2;
console.log(x);

let num = 1;
num += 5;
num -= 3;
num *= 7;
num /= 3;
num++;
num--;
console.log(num);

let age1 = Number(prompt('Сколько Вам лет?'));
console.log(age1);

const user = {
    name: 'Mickey',
    age: 37 ,
    Boolean: "isAdmin"
 }
 
 let info = prompt("Что вы хотите узнать о пользователе?", "name");
 
console.log(user[info]); 


let info10 = prompt('Как твоё имя ?');
console.log(` Привет, ${info10}!`);

let d = String(prompt('Введите пароль '));
const c = "xxx"
if (c === d) {
    console.log('Пароль введен верно');
} else {
    console.log('Пароль введен не верно');
}

let time = Number(prompt('Введите число '));
if (time >=0 && time <=10) {
    console.log('Верно');
} else {
    console.log('Неверно');
}

let z = Number(prompt("Введите число"));
let y = Number(prompt("Введите второе число"));
if (z >= 100 || y >= 100) {
    console.log('Верно');
} else {
    console.log('Неверно');
}

let q = '2';
let w = '3';
console.log(Number(q) + Number(w));

let month = String(prompt('Введите месяц '));
month = month.toLocaleLowerCase();
switch (month) {
    case 'january':
        console.log('Winter');
    break;
    case 'february':
        console.log('Winter');
    break;
    case 'march':
        console.log('spring');
    break;
    case 'april':
        console.log('spring');
    break;
    case 'may':
        console.log('spring');
    break;
    case 'june':
        console.log('Summer');
    break;
    case 'jule':
        console.log('Summer');
    break;
    case 'august':
        console.log('Summer');
    break;
    case 'september':
        console.log('autumn');
    break;
    case 'october':
        console.log('autumn');
    break;
    case 'november':
        console.log('autumn');
    break;
    case 'december':
        console.log('winter');
    break;
    default: console.log('Неверное значение');
        break;
}


let p = 0;
while (p < 2) {
    console.log('Привет');
    p++;
}

let j = 1;
while (j <= 5) {
    console.log(j);
   j++;
}


let l = 7;
while (l <= 22) {
    console.log(l);
    l++;
}


const obj = {
Kol : '200',
Vas : '300',
Pet : '400'
 }
 
 for (let key in obj) {
    console.log(`${key}: ${obj[key]} $`);
 }

 let m = 1000;
 let mun = 0;
 while ( m >= 50) {
    m /= 2;
    console.log(m);
    mun++;
 }
 console.log(`Количество циклов ${mun}`);


 let dayFriday = 3;
 let allDay = 31;
 for (let i = dayFriday; i < allDay; i += 7) {
    console.log(`Сегодня пятница, ${i}-е число.Подготовь отчет.`);
 }









 








