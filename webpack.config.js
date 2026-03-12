const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: './src/client/index.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: {
                    loader: 'ts-loader', 
                    options: {
                        configFile: "tsconfig.client.json"
                    },
                },
                exclude: /node_modules/
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 4000,
    },

    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: 'src/client',
                    to: 'client'
                }
            ]
        })
    ]
};
