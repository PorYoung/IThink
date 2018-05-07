const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cleanWebpackPlugin = require('clean-webpack-plugin')
const webpack = require('webpack')
module.exports = {
    devtool: 'eval-source-map',

    entry: {
        common: [
            './src/lib/jquery-3.3.1.min.js',
            './src/lib/bootstrap-3.3.7-dist/js/bootstrap.min.js'            
        ],
        app: './src/index.js',
        login: './src/component/login/login.js',
        management: ['./src/component/router.js','./src/component/management/management.js']
    },

    output: {
        publicPath: '/static/dist',
        filename: '[name].bundle-[hash].js',
        path: path.resolve(__dirname, 'static/dist')
    },
    module: {
        rules: [{
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["env"]
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader', 'css-loader'
                ]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png)\w*/,
                use: ['file-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'IThink Login',
            template: path.resolve(__dirname,'src/component/login/login.html'),
            //指定index页面需要的模块
            chunks:['commons','login'],
            filename: path.resolve(__dirname,'server/views/login.html')
        }),
        // new HtmlWebpackPlugin({
        //     title: 'IThink Manager',
        //     template: path.resolve(__dirname, 'src/views/index/index.html'),
        //     //指定index页面需要的模块
        //     chunks: ['commons', 'app'],
        //     filename: path.resolve(__dirname, 'server/views/index.html')
        // }),
        new cleanWebpackPlugin(['./static/dist', path.resolve(__dirname,'server/views')]),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ],
    //路径别名配置，让模块加载更直观
    // resolve: {
    //     //设置可省略文件后缀名(注:如果有文件没有后缀设置‘’会在编译时会报错,必须改成' '中间加个空格。ps:虽然看起来很强大但有时候省略后缀真不知道加载是啥啊~);
    //     extensions: [' ', '.css', '.less', '.js', '.json', '.vue'],
    //     //模块路径查找时先从数组第一个开始寻找，找不到在去node_modules目录下寻找
    //     modules: [path.resolve(__dirname, "src"), "node_modules"],
    //     //别名设置
    //     alias: {
    //         "components": path.resolve(__dirname, 'src/components'),
    //         "lib": path.resolve(__dirname, 'src/lib'),
    //     }
    // },
    devServer: {
        contentBase: ['./static/dist','./server/views'],
        port: '3000'
      } 
}