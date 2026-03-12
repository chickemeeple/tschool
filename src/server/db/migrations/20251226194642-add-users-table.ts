import { QueryInterface, DataTypes, QueryTypes, Sequelize } from 'sequelize';
import config from '../config/config.json';
config

/** @type {import("sequelize-cli").Migration} */
module.exports = {
    up: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
        async (transaction) => {
          return queryInterface.createTable('users', {
            uid: {
              type: DataTypes.STRING,
              allowNull: false
            },
            username: {
              type: DataTypes.STRING,
              allowNull:false
            },
            email: {
              type: DataTypes.STRING,
              allowNull: false
            },
            hash: {
              type: DataTypes.STRING,
              allowNull: false
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE
          })
        }
    ),

    down: (queryInterface: QueryInterface): Promise<void> => queryInterface.sequelize.transaction(
        async (transaction) => {
          return queryInterface.dropTable('users')
        }
    )
};
