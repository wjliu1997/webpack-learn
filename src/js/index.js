import '../css/index.css';
import '../css/index.less';
import '../css/iconfont.css';

// //js兼容第二种方案,直接引入
// import '@babel/polyfill';

const add = (a, b) => a + b;

const promise = new Promise((resolve) => {
  setTimeout(() => {
    console.log('定时器执行');
    resolve();
  }, 1000);
});
console.log(add(1, 3));
