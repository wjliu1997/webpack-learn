const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
/**
 * PWA:渐进式网络开发应用程序(离线可访问)
 *  workbox --> workbox-webpack-plugin
 */

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
  entry: [path.join(__dirname, 'src', 'js', 'index'), './src/index.html'],
  output: {
    path: path.join(__dirname, 'dist'),

    /**
     * 文件资源缓存
     * hash:每次webpack构建时会生成一个唯一的hash值
     *  问题:由于js和css使用一个hash值,如果重新打包,会导致所有的缓存失效,即使只改动了一个文件,客户端会重新请求所有资源
     * chunkhash:根据chunk生成的hash值,如果打包来源于同一个chunk,那么hash值就是一样的
     *  问题:js和csshash还是一样的,因为css是在js中被引入的,所以同属于一个chunk
     * contenthash:根据文件的内容生成hash值,不同文件的hash值不一样
     */
    filename: 'js/[name].[contenthash:10].js',
  },
  module: {
    rules: [
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
        oneOf: [
        // 一个文件只会被以下一个loader处理,提升构建速度,以免一个文件被多个loader处理
        // 注意:不能有两个配置处理同一类型文件

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
              // babel缓存,在第二次构建时,会读取之前的缓存,类似于HMR
              cacheDirectory: true,
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

    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    // css提取到单独文件插件
    new MiniCssExtractPlugin({
      filename: 'css/built.[contenthash:10].css',
    }),
    new CssMinimizerWebpackPlugin(),
    // 清理打包文件
    new CleanWebpackPlugin(),
    new WorkboxWebpackPlugin.GenerateSW({
      /**
       * 1,帮助serviceworker快速启动
       * 2,删除旧的serviceworker
       *
       * 生成一个servicework配置文件
       */
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  devServer: {
    port: 8080,
    open: true,
    compress: true,
    /* HMR: hot module replacement 热模块替换,作用:一个模块发生变化,只会重新打包这个模块(而不是打包所有模块)

    样式文件:可以使用HMR功能,style-loader内部实现了,只需设置hot:true
    js文件:默认不能使用HMR功能 --> 需要修改js代码,添加支持HMR功能的代码
    html文件:默认不能使用HMR功能,而且不能热更新(通过修改entry:[***,"./src/index.html"]解决热更新问题),不需要HMR功能
    */
    hot: true,
  },

  // 调整打包文件体积上限
  performance: {
    maxEntrypointSize: 10000000,
    maxAssetSize: 30000000,
  },

  /**
   * source-map:一种提供源代码到构建后代码映射技术(如果构建后代码出错了,方便追踪源代码错误)
   * [inline-|hidden-|eval-][nosources-][cheap-[module-]]source-map
   *
   * source-map css,js外部
   *     错误代码准确信息 和 源代码的错误位置
   * inline-source-map css,js内联,只生成一个内联source-map
   *      错误代码准确信息 和 源代码的错误位置
   * hidden-source-map css,js外部
   *       错误代码原因,没有错误位置,不能追踪到源代码位置(只隐藏源代码,会提示构建后代码错误信息)
   * eval-source-map 内联,在js生成对应的source-map,都在eval
   *       错误代码准确信息 和 源代码的错误位置,多了hash值
   *
   * nosources-source-map css,js外部
   *       错误代码准确信息,但是没有任何源代码信息(隐藏源代码,不会提示构建后代码错误信息)
   * cheap-source-map 无变化?既没内联也没外部
   *        错误代码准确信息 和 源代码的错误位置,但是只能精确到行(如把一行错误代码和一行正确代码写在一行中,会显示整行都是错误)
   * cheap-module-source-map css外部,js无变化?
   *        modeul会将loader的source map加入
   *
   *
   * 开发环境:速度快(eval>inline>cheap),调试友好
   *    速度快: eval-cheap-source-map,eval-source-map
   *    调试友好:source-map,cheap-module-source-map,cheap-source-map
   *    推荐:eval-source-map
   * 生产环境:源代码隐藏?调试要不要友好?内联会让代码体积变大,生产环境下不用内联
   *    隐藏:nosources-source-map,hidden-source-map
   *    推荐:source-map/cheap-module-source-map
   * 内联和外部区别:1.外部生成了文件,内联没有,2.内联构建更快
   */
  devtool: 'source-map',
  // 1,可以将node_modules中代码单独打包成一个chunk最终输出,2,同时解决多入口文件重复import问题
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

};
