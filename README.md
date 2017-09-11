## 阿里函数计算项目的宿主工具

本地开发了大量服务和方法的时候，app要调用函数计算，每次都需要先把函数计算提交到阿里云，app中通过api gateway或本地post方式访问。
本工具在本地启动一个http服务，在post方法中模拟调用具体的函数计算代码。app端链接本服务即可使用本地的函数计算服务。

### 注意
此工具适用于nodejs语言开发的函数计算。
默认函数计算的代码结构如下：
```
services/
├── service1/
│   ├── function1/
│   │   ├── index.js // handler所在的入口文件
│   │   └── ...
│   ├── function2/
│   │   ├── index.js // handler所在的入口文件
│   │   └── ...
└── service2/
    ├── function3/
    │   ├── index.js // handler所在的入口文件
    │   └── ...
    └── function4/  // 必须
        ├── index.js // handler所在的入口文件
        └── ...
...
```
services下存放服务目录，每个服务目录下存放自己的函数目录，每个函数目录下存放自己的函数实现。默认入口为index.js，其中有handler方法

### 安装
使用npm全局安装：
```
    npm install fc-serv -g
```

### 运行
在services的上一级目录运行：
```
    fc-serv [-d services]
```

### 参数说明
-d 指定服务所在的目录。默认为services。值可以是相对路径

