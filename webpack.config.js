const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const cleanWebpackPlugin = require('clean-webpack-plugin')
const LessPluginCleanCSS = require('less-plugin-clean-css')
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
        management: ['./src/component/router.js', './src/component/management/management.js']
    },

    output: {
        publicPath: '/static/dist/',
        filename: 'js/[name].bundle-[hash].js',
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
                test: /\.css/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    }
                ]
            },
            {
                test: /\.(less)/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },
                    'postcss-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            lessPlugins: [
                                new LessPluginCleanCSS({
                                    advanced: true
                                })
                            ]
                        }
                    }
                ]
            },
            {
                // test: /\.(eot|svg|ttf|woff|woff2|png)\w*/,
                test: /\.(eot|svg|ttf|woff|woff2)\w*/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: 'font/[name].[hash].[ext]',
                        publicPath: '/static/dist/'
                    }
                }]
            },
            {
                test: /\.(png|jpg|gif)/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 4096, // 把小于50000 byte的文件打包成Base64的格式写入JS
                        name: 'image/[name].[hash].[ext]',
                        publicPath: '/static/dist/'
                    }
                }]
            },
            {
                test: /\.(htm|html)$/,
                use: {
                    loader: 'html-loader'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'IThink Login',
            template: path.resolve(__dirname, 'src/component/login/login.html'),
            chunks: ['commons', 'login'],
            filename: path.resolve(__dirname, 'server/views/login.html')
        }),
        new HtmlWebpackPlugin({
            title: 'IThink Management',
            template: path.resolve(__dirname, 'src/component/management/management.html'),
            //指定index页面需要的模块
            chunks: ['commons', 'management'],
            filename: path.resolve(__dirname, 'server/views/management.html')
        }),
        // new HtmlWebpackPlugin({
        //     title: 'IThink Manager',
        //     template: path.resolve(__dirname, 'src/views/index/index.html'),
        //     //指定index页面需要的模块
        //     chunks: ['commons', 'app'],
        //     filename: path.resolve(__dirname, 'server/views/index.html')
        // }),
        new cleanWebpackPlugin(['./static/dist', path.resolve(__dirname, 'server/views')]),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin()
    ],
}