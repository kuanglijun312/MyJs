# MyJs
我的一些常用的js

### base.js
主要是dom的操作；支持$,on,off,addClass,css,attr等;
其中on支持 delegate，
比如
```javascript
$('#main').on('click','.action',function(e) {
  console.log(this,e);
});
```
off，可以去除通过on添加的事件,内部实现，对on会记一个windows的全局变量熟悉记录在元素的data上;

