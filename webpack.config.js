const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

const commonCssLoader = [
  // //将js中的css提取为style标签
  // 'style-loader',
  // 将js中的css提取到单独的css文件
  MiniCssExtractPlugin.loader,
  // 将css写入js中
  'css-loader',
  /**
   * css兼容性处理:
   * postcss --> postcss-loader postcss-preset-env
   * 对应的插件postcss-preset-env是帮postcss找到package.json中的browserlist里面的配置，通过配置加载指定的css兼容性样式
   */
  {
    // 使用loader默认配置
    // 'postcss-loader',
    // 修改loader的配置,同时在package.json中配置browserslist,通过process.env.NODE_ENV来切换生产环境(默认)和开发环境
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [
          require('postcss-preset-env')(),
        ],
      },
    },
  },
];

// process.env.NODE_ENV = 'development';
module.exports = {
  // Webpack 将生成 web 平台的运行时代码，并且只使用 ES5 相关的特性。
  target: ['web', 'es5'],
  // mode: 'development',

  // 生产环境下,自动压缩js和html代码
  mode: 'production',
  entry: path.join(__dirname, 'src', 'js', 'index'),
  output: {
    path: path.join(__dirname, 'dist'),
    // publicPath: "/dist/",
    filename: 'js/bundle.js',
  },
  module: {
    rules: [
      /*
        正常来讲,一个文件只能被一个loader处理.
        当一个文件要被多个loader处理,那么一定要指定loader执行的先后顺序:先执行eslint 在执行babel

      */
      {
        /* js兼容性处理:babel-loader
          1.基本js兼容性处理 -->@babel/preset-env(只可以处理基本的es6语法 无法处理promise)
          2.全部js兼容性处理 -->@babel/polyfill(会引入所有兼容性处理代码,体积太大)
          3.按需进行兼容性处理-->core-js
        */

        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          // 预设:指示babel做怎么样的兼容性处理
          presets: [
            [
              '@babel/preset-env',
              {
                // 按需加载
                useBuiltIns: 'usage',
                // 指定core-js版本
                corejs: {
                  version: 2,
                },
                // 指定兼容性做到哪个版本浏览器
                targets: {
                  chrome: '60',
                  firefox: '60',
                  ie: '8',
                  safari: '10',
                  edge: '17',
                },
              },
            ],
          ],
        },

      },
      {
        /*
          语法检查
          在package.json中设置检查规则
          "eslintConfig": {
              "extends": "airbnb-base"
            }
        */
        test: /\.js$/,
        loader: 'eslint-loader',
        // 只用检查自己的源代码
        exclude: /node_modules/,
        // 先执行eslint-loader
        enforce: 'pre',
        options: {
          // 自动修复
          fix: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          ...commonCssLoader,
        ],
      },
      {
        test: /\.less$/,
        use: [
          ...commonCssLoader,
          'less-loader',
        ],
      },
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 8 * 1024,
          name: '[hash:10].[ext]',
          outputPath: 'img',
          esModule: false,
        },
        type: 'javascript/auto',
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        exclude: /\.(html|js|css|less|jpg|png|gif)/,
        loader: 'file-loader',
        options: {
          name: '[hash:10].[ext]',
          outputPath: 'media',
          esModule: false,
        },
        type: 'javascript/auto',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    // css提取到单独文件插件
    new MiniCssExtractPlugin({
      filename: 'css/built.css',
    }),
    new CssMinimizerWebpackPlugin(),
  ],
  devServer: {
    port: 8080,
    open: true,
    compress: true,
  },
};
