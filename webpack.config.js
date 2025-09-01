// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
            // JS/JSX → Babel
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            ['@babel/preset-react', { runtime: 'automatic', sourcemap: true }]
                        ]
                    }
                }
            },

            // Tailwind/PostCSS 처리 (index.css 전용)
            {
                test: /index\.css$/,
                include: path.resolve(__dirname, 'src'),
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                config: path.resolve(__dirname, 'postcss.config.cjs')
                            }
                        }
                    }
                ]
            },

            // 일반 CSS (나머지 .css 파일)
            {
                test: /\.css$/,
                exclude: path.resolve(__dirname, 'src/index.css'),
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },

            // 이미지 등 에셋 리소스
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx'],
        fallback: {
            buffer: require.resolve('buffer/'),
            util: require.resolve('util/'),
            stream: require.resolve('stream-browserify'),
            'process/browser': require.resolve('process/browser')
        }
    },

    plugins: [
        new HtmlWebpackPlugin({ template: './public/index.html' }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
        isDev && new ReactRefreshWebpackPlugin(),  // ✅ 추가
    ].filter(Boolean),

    devServer: {
        static: { directory: path.join(__dirname, 'public') },
        port: 6400,
        hot: true,
        liveReload: false,       // HMR 우선 사용
        historyApiFallback: true
    },
};
