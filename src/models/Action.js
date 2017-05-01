import Sequelize from 'sequelize';

import sequelize from '../sequelize';

import App from './App';
import User from './User';

const Action = sequelize.define('action', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
  },
  actionName: {
    type: Sequelize.STRING,
  },
});

Action.belongsTo(App);
Action.belongsTo(User);

Action.sync();

module.exports = Action;