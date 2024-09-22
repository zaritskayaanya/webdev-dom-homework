let age = 10;
alert(age);
let up = 20;
alert(up);
let date = ('Дата выхода Iphone1 20.06.2007');
alert(date);
let namejs = ('создатель js Brendan Eich');
alert(namejs);

let addition = 10;
let additionup = 2;
let result = addition + additionup ;
alert(result);

let difference = 10;
let differencebot = 2;
let result2 = difference - differencebot;
alert(result2);

let divide = 10;
let dividebot = 2;
let result3 = divide / dividebot;
alert(result3);

let i = 2**5;
alert(i);

let a = 9;
let b = 2;
let x = 9 / 2;
alert(x);

let num = 1;
num += 5;
num -= 3;
num *= 7;
num /= 3;
num++;
num--;
alert(num);

let age1 = Number(prompt('Сколько Вам лет?'));
alert(age1);

const user = {
    name: 'Mickey',
    age: 37 ,
    Boolean: "isAdmin"
 };
 
 let info = prompt("Что вы хотите узнать о пользователе?", "name");
 
console.log(user[info]); 


let privet = 'Привет,';
let name3 =String(prompt('Как Вас зовут?'));
let sign = '!';
result4 = privet + name3 + sign;
alert( result4 );

let info10 = prompt('Как твоё имя ?');
alert(` Привет, ${info10}!`);

let d = String(prompt('Введите пароль '));
let c = String(prompt('Введите пароль '));
if (c === d) {
    alert('Пароль введен верно');
} else {
   alert('Пароль введен не верно');
}

let time = Number(prompt('Введите число '));
if (time >=0 && time <=10) {
    alert('Верно');
} else {
    alert('Неверно');
    
}

let z = Number(prompt('Введите число '));
let y = Number(prompt('Введите второе число '));
if (z >=100) {
    alert('Верно');
} else if (y >=100) {
    alert('Верно');
} else {
    alert('Неверно')
}


let q = '2';
let w = '3';
alert (Number('2') + 3);

let month = String(prompt('Введите месяц '));
month = month.toLocaleLowerCase();
switch (month) {
    case 'january':
        alert('Winter');
    break;
    case 'february':
        alert('Winter');
    break;
    case 'march':
        alert('spring');
    break;
    case 'april':
        alert('spring');
    break;
    case 'may':
        alert('spring');
    break;
    case 'june':
        alert('Summer');
    break;
    case 'jule':
        alert('Summer');
    break;
    case 'august':
        alert('Summer');
    break;
    case 'september':
        alert('autumn');
    break;
    case 'october':
        alert('autumn');
    break;
    case 'november':
        alert('autumn');
    break;
    case 'december':
        alert('winter');
    break;

    default: alert('Неверное значение');
        break;
}





