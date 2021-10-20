import '../css/index.css';
import '../css/index.less';
import '../css/iconfont.css';
import print from './print';
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
console.log(100);
print();

// HMR功能 js中需要添加的代码
if (module.hot) {
  /**
   * 当设置mudule.hot为true时,说明开启了HMR功能
   * 方法监听print.js的变化,一旦发生变化,其他模块不会重新打包构建,会执行后面的回调函数
   */
  module.hot.accept('./print.js', () => {
    print();
  });
}
