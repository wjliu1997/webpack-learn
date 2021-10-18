const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'src', 'js', 'index'),
  output: {
    path: path.join(__dirname, 'dist'),
    // publicPath: "/dist/",
    filename: 'js/bundle.js',
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
        options: {
          // 自动修复
          fix: true,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
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
  ],
  devServer: {
    port: 8080,
    open: true,
    compress: true,
  },
};
